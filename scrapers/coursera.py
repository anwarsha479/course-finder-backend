import requests
from bs4 import BeautifulSoup
import re
import json
import sys

def convert_reviews(text):
    """Convert '2.9K reviews' to 2900 and '41K reviews' to 41000."""
    match = re.match(r"(\d+\.?\d*)([Kk]?)", text)
    if match:
        number = float(match.group(1))
        if match.group(2).lower() == 'k':
            number *= 1000
        return int(number)
    return 0

def scrape_coursera_courses(search_query):
    query = search_query.replace(" ", "+")
    base_url = f"https://www.coursera.org/search?query={query}"

    # Fetch the webpage
    response = requests.get(base_url)
    if response.status_code != 200:
        return {
            "success": False,
            "message": f"Failed to fetch data. Status Code: {response.status_code}",
            "courses": []
        }

    # Parse HTML content
    soup = BeautifulSoup(response.text, 'html.parser')

    # Find all course listings
    course_cards = soup.find_all('div', class_='cds-ProductCard-footer')

    courses = []
    for card in course_cards:
        try:
            # Extract course title
            title_tag = card.find_previous('a', {'aria-label': True})
            if title_tag:
                raw_title = title_tag.get('aria-label', '')
                clean_title = raw_title.split(" by ")[0].strip()
                if clean_title.endswith(", offered"):
                    clean_title = clean_title.replace(", offered", "").strip()
                title = clean_title
            else:
                title = "Unknown Course"

            # Extract course page URL
            course_url = "https://www.coursera.org" + title_tag['href'] if title_tag else "N/A"

            # Extract rating
            rating_tag = card.select_one('.cds-RatingStat-meter span.css-6ecy9b')
            rating = float(rating_tag.text.strip()) if rating_tag and rating_tag.text.strip().replace('.', '', 1).isdigit() else None

            # Extract review count
            reviews_tag = card.select_one('.css-vac8rf')
            if reviews_tag and reviews_tag.find_next('div', class_='css-vac8rf'):
                reviews_text = reviews_tag.find_next('div', class_='css-vac8rf').text.strip()
            else:
                reviews_text = "N/A"
            reviews_count = convert_reviews(reviews_text)

            # Extract level and duration
            metadata = card.select_one('.cds-CommonCard-metadata p.css-vac8rf')
            if metadata:
                metadata_text = metadata.text.strip()
                level_match = re.search(r'(Beginner|Intermediate|Advanced)', metadata_text)
                duration_match = re.search(r'(\d+ - \d+ Months|\d+ - \d+ Weeks)', metadata_text)

                level = level_match.group(1) if level_match else "Unknown"
                duration = duration_match.group(1) if duration_match else "Unknown"
            else:
                level, duration = "Unknown", "Unknown"

            # Store course details
            courses.append({
                "course_title": title,
                "provider": "Coursera",
                "rating": rating,
                "reviews_count": reviews_count,
                "duration": duration,
                "level": level,
                "url": course_url
            })

        except Exception as e:
            continue

    return {
        "success": True,
        "courses": courses
    }

# Run as script
if __name__ == "__main__":
    search_topic = sys.argv[1] if len(sys.argv) > 1 else "python"
    result = scrape_coursera_courses(search_topic)
    print(json.dumps(result, indent=2))
