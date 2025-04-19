import time
import json
import atexit
import sys
from typing import List, Dict, Optional
import undetected_chromedriver as uc
from bs4 import BeautifulSoup
from selenium.webdriver.chrome.options import Options
from selenium.common.exceptions import TimeoutException, WebDriverException

class Course:
    def __init__(self, title: str, rating: float, review_count: int, url: str, level: str):
        self.course_title = title
        self.provider = "Pluralsight"
        self.rating = rating
        self.reviews_count = review_count
        self.duration = "2 - 7 hours"  # Placeholder duration
        self.level = level
        self.url = url

    def to_dict(self) -> Dict:
        return {
            "course_title": self.course_title,
            "provider": self.provider,
            "rating": self.rating,
            "reviews_count": self.reviews_count,
            "duration": self.duration,
            "level": self.level,
            "url": self.url
        }

class PluralsightScraper:
    def __init__(self):
        self.options = self._setup_chrome_options()
        self.driver = None
        atexit.register(self.cleanup)
        
    @staticmethod
    def _setup_chrome_options() -> Options:
        options = Options()
        options.add_argument("--headless=new")  # New headless mode
        options.add_argument("--disable-gpu")
        options.add_argument("--window-size=1920,1080")
        options.add_argument("--disable-blink-features=AutomationControlled")
        options.add_argument("--no-sandbox")
        options.add_argument("--disable-dev-shm-usage")
        return options

    def _create_driver(self):
        if not self.driver:
            self.driver = uc.Chrome(options=self.options)
        return self.driver

    def cleanup(self):
        if self.driver:
            try:
                self.driver.quit()
            except WebDriverException as e:
                print(f"⚠️ Error while quitting WebDriver: {e}")
            finally:
                self.driver = None

    def _extract_course_data(self, course_element) -> Optional[Course]:
        try:
            title_element = course_element.select_one(".search-result__title a")
            if not title_element:
                return None
            
            title = title_element.text.strip()
            url = title_element.get("href", "#")
            if url and not url.startswith("https"):
                url = f"https://www.pluralsight.com{url}"

            rating_element = course_element.select_one(".search-result__rating")
            if rating_element:
                full_stars = len(rating_element.select("i.fa-star"))
                half_stars = len(rating_element.select("i.fa-star-half-o"))
                rating = full_stars + (0.5 if half_stars > 0 else 0)
                
                review_count_text = rating_element.text.strip()
                review_count = (
                    review_count_text.split("(")[-1].split(")")[0]
                    if "(" in review_count_text else "0"
                )
            else:
                rating, review_count = 0, "0"

            # Extract level information
            level_element = course_element.select_one(".search-result__level")
            level = level_element.text.strip() if level_element else "N/A"

            # Convert review count to integer
            review_count = self._convert_review_count(review_count)

            return Course(title, rating, review_count, url, level)
        except Exception as e:
            print(f"Error extracting course data: {e}")
            return None

    @staticmethod
    def _convert_review_count(review_count: str) -> int:
        try:
            if "K" in review_count:
                return int(float(review_count.replace("K", "")) * 1000)
            elif "M" in review_count:
                return int(float(review_count.replace("M", "")) * 1000000)
            return int(review_count) if review_count.isdigit() else 0
        except ValueError:
            return 0  # Default to 0 if parsing fails

    def scrape_courses(self, topic: str, limit: int = 10) -> Dict:
        search_url = f"https://www.pluralsight.com/search?q={topic}&categories=course"
        driver = self._create_driver()
        
        try:
            driver.get(search_url)
            time.sleep(3)  # Allow time for page to load
            
            soup = BeautifulSoup(driver.page_source, "html.parser")
            course_elements = soup.select(".search-result")
            
            courses = []
            for course_element in course_elements[:limit]:
                course = self._extract_course_data(course_element)
                if course:
                    courses.append(course.to_dict())
            
            return {"success": True, "courses": courses}
        except (TimeoutException, WebDriverException) as e:
            print(f"⚠️ Error fetching course data: {e}")
            return {"success": False, "error": str(e)}
        finally:
            self.cleanup()

if __name__ == "__main__":
    if len(sys.argv) > 1:
        topic = " ".join(sys.argv[1:])
    else:
        topic = input("Enter the topic you want to search for: ").strip()

    scraper = PluralsightScraper()
    result = scraper.scrape_courses(topic)
    
    print(json.dumps(result, indent=2))
