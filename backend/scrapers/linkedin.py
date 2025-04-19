from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager
from selenium.common.exceptions import StaleElementReferenceException, TimeoutException, NoSuchElementException
import json
import os
import sys

def get_course_details(driver, course_url):
    """
    Extracts the rating, number of reviews, and skill level from a LinkedIn Learning course page.
    """
    driver.execute_script("window.open('');")
    driver.switch_to.window(driver.window_handles[1])
    driver.get(course_url)

    try:
        # Extract course rating
        rating_tag = WebDriverWait(driver, 5).until(
            EC.presence_of_element_located((By.CLASS_NAME, 'ratings-summary__rating-average'))
        )
        rating = float(rating_tag.text.strip()) if rating_tag.text.strip().replace('.', '', 1).isdigit() else 0.0
    except (TimeoutException, NoSuchElementException):
        rating = None

    try:
        # Extract number of reviews
        reviews_tag = driver.find_element(By.CLASS_NAME, 'ratings-summary__ratings-total')
        reviews_text = reviews_tag.text.strip().replace(" ratings", "").replace(",", "")
        reviews_count = int(reviews_text) if reviews_text.isdigit() else 0
    except (NoSuchElementException, ValueError):
        reviews_count = 0

    try:
        # Extract Skill Level (e.g., "Skill level: Beginner")
        level_tag = driver.find_element(By.XPATH, "//span[contains(text(), 'Skill level:')]")
        level_text = level_tag.text.replace("Skill level:", "").strip()
    except NoSuchElementException:
        level_text = "Unknown"

    driver.close()
    driver.switch_to.window(driver.window_handles[0])

    return {
        "rating": rating,
        "reviews_count": reviews_count,
        "level": level_text
    }

def scrape_linkedin_learning_courses(search_query):
    """
    Scrapes LinkedIn Learning for courses based on the given search query.
    """
    query = search_query.replace(" ", "%20")
    base_url = f"https://www.linkedin.com/learning/search?keywords={query}"

    options = webdriver.ChromeOptions()
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    options.add_argument("--headless")
    options.add_argument("--disable-gpu")
    options.add_argument("--window-size=1920,1080")

    driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=options)

    try:
        driver.get(base_url)
        WebDriverWait(driver, 10).until(EC.presence_of_all_elements_located((By.CLASS_NAME, 'base-card')))
        
        course_cards = driver.find_elements(By.CLASS_NAME, 'base-card')
        courses = []

        for index, card in enumerate(course_cards[:10]):
            try:
                # Extract course title
                title_element = WebDriverWait(card, 5).until(
                    EC.presence_of_element_located((By.CLASS_NAME, 'base-search-card__title'))
                )
                title = title_element.text.strip()

                # Extract course URL
                course_url = card.find_element(By.TAG_NAME, 'a').get_attribute('href')
                
                # Extract duration (if available)
                try:
                    duration = card.find_element(By.CLASS_NAME, 'search-entity-media__duration').text.strip()
                except NoSuchElementException:
                    duration = "Unknown"
                
                # Convert duration to minutes and filter out micro-courses
                duration_value = 0
                if "h" in duration:
                    hours, minutes = 0, 0
                    if "m" in duration:
                        parts = duration.split("h")
                        hours = int(parts[0].strip()) if parts[0].strip().isdigit() else 0
                        minutes = int(parts[1].replace("m", "").strip()) if len(parts) > 1 and parts[1].strip().isdigit() else 0
                    else:
                        hours = int(duration.replace("h", "").strip())
                    duration_value = hours * 60 + minutes
                elif "m" in duration:
                    duration_value = int(duration.replace("m", "").strip()) if duration.replace("m", "").strip().isdigit() else 0

                # Get course details from the course page (rating, reviews, level)
                course_info = get_course_details(driver, course_url)
                
                # Store course details only if duration is >= 5 minutes
                if duration_value >= 5:
                    courses.append({
                        "course_title": title,
                        "provider": "LinkedIn Learning",
                        "rating": course_info["rating"],
                        "reviews_count": course_info["reviews_count"],
                        "duration": duration,
                        "level": course_info["level"],
                        "url": course_url
                    })

            except StaleElementReferenceException:
                continue
            except Exception as e:
                continue
    
        return {
            "success": True,
            "courses": courses
        }

    finally:
        driver.quit()

# Example usage
if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({
            "success": False,
            "message": "Please provide a search query",
            "courses": []
        }, indent=2))
        sys.exit(1)

    search_topic = sys.argv[1]
    result = scrape_linkedin_learning_courses(search_topic)
    print(json.dumps(result, indent=2))
    os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'
