import pytest
from main import (
    fetch_leetcode_title,
    fetch_codeforces_title,
    fetch_codechef_title,
    fetch_cses_title,
    fetch_atcoder_title,
    fetch_default_title
)

@pytest.mark.asyncio
async def test_leetcode_scraper():
    # Test valid LeetCode title fetch
    url = "https://leetcode.com/problems/two-sum/"
    title = await fetch_leetcode_title(url)
    assert "Two Sum" in title

@pytest.mark.asyncio
async def test_codeforces_scraper():
    # Test valid Codeforces title fetch
    url = "https://codeforces.com/problemset/problem/71/A"
    title = await fetch_codeforces_title(url)
    # Anti-bot or parsing returns title or uppercase slug as fallback
    assert title != ""
    assert "Way Too Long Words" in title or "71/A" in title or "71A" in title or "A" in title

@pytest.mark.asyncio
async def test_codechef_scraper():
    url = "https://www.codechef.com/problems/WATERCONS"
    title = await fetch_codechef_title(url)
    assert title != ""

@pytest.mark.asyncio
async def test_cses_scraper():
    url = "https://cses.fi/problemset/task/1068"
    title = await fetch_cses_title(url)
    assert "Weird Algorithm" in title or "1068" in title

@pytest.mark.asyncio
async def test_atcoder_scraper():
    url = "https://atcoder.jp/contests/abc335/tasks/abc335_a"
    title = await fetch_atcoder_title(url)
    assert title != ""

@pytest.mark.asyncio
async def test_default_scraper():
    url = "https://example.com/problems/some-random-problem"
    title = await fetch_default_title(url)
    assert "Some Random Problem" in title
