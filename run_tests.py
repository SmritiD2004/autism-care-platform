#!/usr/bin/env python
"""
Quick test runner for NeuroThrive Backend
Run: python run_tests.py
"""

import subprocess
import sys
import os
from pathlib import Path

def run_command(cmd, description):
    """Run a command and report results"""
    print(f"\n{'='*60}")
    print(f"{description}")
    print('='*60)
    
    try:
        result = subprocess.run(cmd, cwd=str(Path(__file__).parent / "backend"), shell=True)
        return result.returncode == 0
    except Exception as e:
        print(f"Error running command: {e}")
        return False

def main():
    print("\n" + "="*60)
    print("NeuroThrive Backend Test Runner")
    print("="*60)
    
    tests = [
        ("python test_basic.py", "Running Basic Unit Tests"),
    ]
    
    results = []
    for cmd, desc in tests:
        success = run_command(cmd, desc)
        results.append((desc, success))
    
    # Summary
    print("\n" + "="*60)
    print("Test Run Summary")
    print("="*60)
    
    for desc, success in results:
        status = "PASS" if success else "FAIL"
        print(f"[{status}] {desc}")
    
    passed = sum(1 for _, s in results if s)
    total = len(results)
    
    print(f"\nResults: {passed}/{total} test suites passed")
    
    if passed == total:
        print("\nAll tests passed! Backend is ready.")
    else:
        print("\nSome tests failed. Check output above for details.")
    
    print("\n" + "="*60)
    print("Next Steps")
    print("="*60)
    print("""
1. Start the backend server:
   cd backend
   uvicorn main:app --reload

2. Test API endpoints (in another terminal):
   cd backend
   python test_integration.py

3. View API docs:
   http://localhost:8000/docs
   
4. Start database with docker-compose:
   docker-compose up -d

For more details, see TESTING.md
""")

if __name__ == "__main__":
    main()
