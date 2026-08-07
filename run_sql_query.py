import sys
import os
from sqlalchemy import text

sys.path.insert(0, r"C:\Users\dell\.gemini\antigravity\scratch\prompt2website\backend")

from app.db.session import SessionLocal, engine

def run_query(sql_statement: str):
    db = SessionLocal()
    try:
        print("==================================================")
        print(f"Executing SQL: {sql_statement}")
        print("==================================================")
        result = db.execute(text(sql_statement))
        
        if sql_statement.strip().lower().startswith("select"):
            rows = result.fetchall()
            keys = result.keys()
            print(f"Columns: {list(keys)}")
            print(f"Total Rows Returned: {len(rows)}")
            print("--------------------------------------------------")
            for idx, r in enumerate(rows, 1):
                print(f"Row #{idx}: {dict(zip(keys, r))}")
        else:
            db.commit()
            print("Query executed successfully & committed!")
    except Exception as e:
        db.rollback()
        print(f"Error executing query: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    if len(sys.argv) > 1:
        query = " ".join(sys.argv[1:])
        run_query(query)
    else:
        print("Defaulting to sample query: SELECT id, email, full_name, is_admin FROM users;")
        run_query("SELECT id, email, full_name, is_admin FROM users;")
