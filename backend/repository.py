import csv
import os
import shutil
import zlib
from abc import ABC, abstractmethod
from typing import List, Optional

class BaseProblemRepository(ABC):
    @abstractmethod
    def get_all(self) -> List[dict]:
        """Retrieve all problems."""
        pass

    @abstractmethod
    def get_by_id(self, problem_id: int) -> Optional[dict]:
        """Retrieve a single problem by ID."""
        pass

    @abstractmethod
    def add(self, problem: dict) -> dict:
        """Add a new problem."""
        pass

    @abstractmethod
    def update(self, problem_id: int, update_data: dict) -> dict:
        """Update an existing problem."""
        pass

    @abstractmethod
    def delete(self, problem_id: int) -> None:
        """Delete a problem."""
        pass

class CSVProblemRepository(BaseProblemRepository):
    def __init__(self, csv_path: str, fallback_data: Optional[List[dict]] = None):
        self.csv_path = csv_path
        self.fallback_data = fallback_data or []
        self._ensure_csv_exists()

    def _ensure_csv_exists(self):
        directory = os.path.dirname(self.csv_path)
        if directory:
            os.makedirs(directory, exist_ok=True)
        if not os.path.exists(self.csv_path):
            self._write_all(self.fallback_data)

    def _generate_id(self, link: str) -> int:
        # Generate a stable 32-bit integer hash from the problem link URL
        # Clean/normalize URL a bit (strip trailing slash) to handle minor variations
        normalized_link = link.rstrip('/')
        return zlib.crc32(normalized_link.encode('utf-8'))

    def _read_all(self) -> List[dict]:
        if not os.path.exists(self.csv_path):
            return []
        problems = []
        with open(self.csv_path, mode="r", encoding="utf-8-sig", newline="") as f:
            reader = csv.DictReader(f)
            for row in reader:
                # Ensure all columns are present. Provide defaults if missing.
                link = row.get("link", "")
                if not link:
                    continue  # Ignore invalid rows without links
                
                # Dynamically generate deterministic ID based on link
                prob_id = self._generate_id(link)
                
                # Parse tags: split by comma if it's a string, strip spaces
                tags_raw = row.get("tags", "")
                if tags_raw:
                    tags = [t.strip() for t in tags_raw.split(",") if t.strip()]
                else:
                    tags = []
                
                # Parse isNew boolean
                is_new_raw = row.get("isNew", "False")
                is_new = is_new_raw.lower() in ("true", "1", "yes")
                
                problems.append({
                    "id": prob_id,
                    "platform": row.get("platform", ""),
                    "platformIcon": row.get("platformIcon", ""),
                    "title": row.get("title", ""),
                    "link": link,
                    "tags": tags,
                    "difficulty": row.get("difficulty", ""),
                    "notes": row.get("notes", ""),
                    "isNew": is_new
                })
        return problems

    def _write_all(self, problems: List[dict]):
        # Write to temporary file first to avoid corruption, then rename
        temp_path = self.csv_path + ".tmp"
        # CSV file does not store 'id'
        fieldnames = ["platform", "platformIcon", "title", "link", "tags", "difficulty", "notes", "isNew"]
        
        with open(temp_path, mode="w", encoding="utf-8", newline="") as f:
            writer = csv.DictWriter(f, fieldnames=fieldnames)
            writer.writeheader()
            for prob in problems:
                row = prob.copy()
                
                # Convert tags list to comma-separated string
                if isinstance(row.get("tags"), list):
                    row["tags"] = ",".join(row["tags"])
                
                # Ensure isNew is written as True/False string
                if "isNew" in row:
                    row["isNew"] = str(bool(row["isNew"]))
                
                # Write row matching fieldnames
                writer.writerow({k: row.get(k, "") for k in fieldnames})
                
        shutil.move(temp_path, self.csv_path)

    def get_all(self) -> List[dict]:
        return self._read_all()

    def get_by_id(self, problem_id: int) -> Optional[dict]:
        problems = self._read_all()
        for p in problems:
            if p["id"] == problem_id:
                return p
        return None

    def add(self, problem: dict) -> dict:
        problems = self._read_all()
        # Verify link uniqueness (since id is derived from link, duplicate link = duplicate id)
        link = problem.get("link", "")
        if not link:
            raise ValueError("Problem must have a valid link.")
            
        prob_id = self._generate_id(link)
        if any(p["id"] == prob_id for p in problems):
            raise ValueError("A problem with this link already exists.")
            
        # Assign generated ID to the returned object
        new_problem = problem.copy()
        new_problem["id"] = prob_id
        
        problems.append(new_problem)
        self._write_all(problems)
        return new_problem

    def update(self, problem_id: int, update_data: dict) -> dict:
        problems = self._read_all()
        target_idx = -1
        for i, p in enumerate(problems):
            if p["id"] == problem_id:
                target_idx = i
                break
                
        if target_idx == -1:
            raise KeyError(f"Problem with ID {problem_id} not found.")
            
        target = problems[target_idx]
        
        # Partially update allowed fields
        for k, v in update_data.items():
            if k in ["link", "platform"]:
                # As per existing main.py restrictions, link and platform cannot be modified
                continue
            target[k] = v
            
        problems[target_idx] = target
        self._write_all(problems)
        return target

    def delete(self, problem_id: int) -> None:
        problems = self._read_all()
        filtered = [p for p in problems if p["id"] != problem_id]
        if len(filtered) == len(problems):
            raise KeyError(f"Problem with ID {problem_id} not found.")
        self._write_all(filtered)
