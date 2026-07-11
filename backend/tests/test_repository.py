import pytest
import os
from repository import CSVProblemRepository

def test_csv_repository_lifecycle(tmp_path):
    csv_file = tmp_path / "problems.csv"
    csv_path = str(csv_file)

    fallback = [
        {"platform": "Leetcode", "platformIcon": "◼️", "title": "Two Sum", "link": "https://leetcode.com/problems/two-sum/", "tags": ["two pointers"], "difficulty": "Easy", "isNew": True},
        {"platform": "Codeforces", "platformIcon": "📊", "title": "Watermelon", "link": "https://codeforces.com/problemset/problem/4/A", "tags": ["greedy"], "difficulty": "Easy", "isNew": False}
    ]

    # Initialize repository
    repo = CSVProblemRepository(csv_path=csv_path, fallback_data=fallback)

    # 1. Verify file was created
    assert os.path.exists(csv_path)

    # 2. Get all and verify structure (dynamic ID should be generated)
    problems = repo.get_all()
    assert len(problems) == 2
    
    p1 = problems[0]
    assert p1["title"] == "Two Sum"
    assert "id" in p1
    assert isinstance(p1["id"], int)
    assert p1["isNew"] is True
    assert p1["tags"] == ["two pointers"]

    # 3. Get by ID
    p1_by_id = repo.get_by_id(p1["id"])
    assert p1_by_id is not None
    assert p1_by_id["link"] == p1["link"]

    # 4. Add a new problem
    new_prob = {
        "platform": "Atcoder",
        "platformIcon": "🐜",
        "title": "Loong Tracking",
        "link": "https://atcoder.jp/contests/abc335/tasks/abc335_c",
        "tags": ["graphs", "recursion"],
        "difficulty": "Medium",
        "isNew": True
    }
    added = repo.add(new_prob)
    assert added["id"] is not None
    assert added["title"] == "Loong Tracking"

    # Verify duplicate link throws ValueError
    with pytest.raises(ValueError, match="already exists"):
        repo.add(new_prob)

    # Verify total count is now 3
    assert len(repo.get_all()) == 3

    # 5. Update a problem
    updated = repo.update(added["id"], {"difficulty": "Hard", "notes": "Updated note", "isNew": False})
    assert updated["difficulty"] == "Hard"
    assert updated["notes"] == "Updated note"
    assert updated["isNew"] is False

    # Verify immutable fields are not changed
    # (Attempt to update 'link' should be ignored by update())
    updated_imm = repo.update(added["id"], {"link": "https://atcoder.jp/contests/abc335/tasks/abc335_d", "platform": "Leetcode"})
    assert updated_imm["link"] == "https://atcoder.jp/contests/abc335/tasks/abc335_c"
    assert updated_imm["platform"] == "Atcoder"

    # 6. Delete a problem
    repo.delete(added["id"])
    assert len(repo.get_all()) == 2
    assert repo.get_by_id(added["id"]) is None

    # Verify deleting non-existent ID throws KeyError
    with pytest.raises(KeyError):
        repo.delete(added["id"])
