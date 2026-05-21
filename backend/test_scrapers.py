import asyncio
from main import (
    fetch_leetcode_title,
    fetch_codeforces_title,
    fetch_codechef_title,
    fetch_cses_title,
    fetch_atcoder_title,
    fetch_default_title
)

async def run_tests():
    # Define the target URLs for each platform to test the scrapers
    test_cases = [
        ("LeetCode", fetch_leetcode_title, "https://leetcode.com/problems/two-sum/"),
        ("Codeforces", fetch_codeforces_title, "https://codeforces.com/problemset/problem/71/A"),
        ("CodeChef", fetch_codechef_title, "https://www.codechef.com/problems/WATERCONS"),
        ("CSES", fetch_cses_title, "https://cses.fi/problemset/task/1068"),
        ("AtCoder", fetch_atcoder_title, "https://atcoder.jp/contests/abc335/tasks/abc335_a"),
        ("Default", fetch_default_title, "https://example.com/problems/some-random-problem")
    ]

    print("====================================")
    print("      Running Scraper Tests...      ")
    print("====================================\n")
    
    for platform, scraper_func, url in test_cases:
        print(f"Testing {platform} Scraper...")
        print(f"URL: {url}")
        try:
            title = await scraper_func(url)
            print(f"Extracted Title: '{title}'\n")
        except Exception as e:
            print(f"Error during scraping: {e}\n")

    print("Tests completed.")

if __name__ == "__main__":
    asyncio.run(run_tests())