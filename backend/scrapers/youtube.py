import requests
import json
import isodate
import sys

API_KEY = "AIzaSyDM5dAwoZq7ZEVUGw2ItEAdIzWR1aOtGJM"

def convert_views_to_rating(views):
    """Converts views into a rating (out of 5) using a logarithmic scale."""
    if views >= 50_000_000:
        return 5.0
    elif views >= 10_000_000:
        return 4.8
    elif views >= 5_000_000:
        return 4.5
    elif views >= 1_000_000:
        return 4.2
    elif views >= 500_000:
        return 4.0
    elif views >= 100_000:
        return 3.8
    else:
        return 3.5

def format_duration(duration):
    """Formats ISO 8601 duration into hours and minutes."""
    total_seconds = isodate.parse_duration(duration).total_seconds()
    hours = int(total_seconds // 3600)
    minutes = int((total_seconds % 3600) // 60)
    
    if hours > 0:
        return f"{hours}h {minutes}m" if minutes > 0 else f"{hours}h"
    return f"{minutes}m"

def fetch_top_courses(query, max_results=10):
    """Fetches the top YouTube courses over 1 hour with standardized output."""
    search_url = "https://www.googleapis.com/youtube/v3/search"
    search_params = {
    "part": "snippet",
    "q": query + " course",  # Adjusted to just 'course'
    "key": API_KEY,
    "maxResults": max_results * 2,
    "type": "video",
    "order": "viewCount"

    }

    response = requests.get(search_url, params=search_params)
    data = response.json()

    video_details = []
    video_ids = []

    if "items" in data:
        for item in data["items"]:
            video_id = item["id"]["videoId"]
            title = item["snippet"]["title"]

            if query.lower() in title.lower():  # Filter based on user input (case-insensitive)
                video_ids.append(video_id)
                video_details.append({
                    "title": title,
                    "url": f"https://www.youtube.com/watch?v={video_id}"
                })

    if not video_ids:
        return {"success": False, "courses": []}

    stats_url = "https://www.googleapis.com/youtube/v3/videos"
    stats_params = {
        "part": "statistics,contentDetails",
        "id": ",".join(video_ids),
        "key": API_KEY
    }

    stats_response = requests.get(stats_url, params=stats_params)
    stats_data = stats_response.json()

    courses = []

    for i, video in enumerate(stats_data["items"]):
        view_count = int(video["statistics"].get("viewCount", 0))
        comment_count = int(video["statistics"].get("commentCount", 0))  # Extract comment count
        duration = video["contentDetails"]["duration"]
        formatted_duration = format_duration(duration)

        if isodate.parse_duration(duration).total_seconds() >= 3600:  # Ensure ≥ 1 hour
            rating = convert_views_to_rating(view_count)
            
            courses.append({
                "course_title": video_details[i]["title"],
                "provider": "YouTube",
                "rating": rating,
                "reviews_count": comment_count,  # Use comment count instead of views
                "duration": formatted_duration,
                "level": "Beginner",  # No level info from YouTube, so defaulting
                "url": video_details[i]["url"]
            })

    return {"success": True, "courses": courses}

if __name__ == "__main__":
    topic = sys.argv[1] if len(sys.argv) > 1 else input("Enter the topic you want to search for: ").strip()
    results = fetch_top_courses(topic)
    print(json.dumps(results, indent=2))
