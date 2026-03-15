#!/usr/bin/env python3

import subprocess
import sys
from typing import List, Optional


def run_command(command: List[str], error_message: str) -> Optional[str]:
    """Execute a shell command and return output or handle errors."""
    try:
        result = subprocess.run(command, shell=False, check=True, text=True, capture_output=True)
        return result.stdout
    except subprocess.CalledProcessError as e:
        print(f"Error: {error_message}")
        print(e.stderr)
        sys.exit(1)


def checkout_and_pull(branch: str) -> None:
    """Checkout a branch and pull the latest changes."""
    print(f"Checking out branch: {branch}")
    run_command(["git", "checkout", branch], f"Failed to checkout branch {branch}")
    run_command(["git", "pull", "origin", branch], f"Failed to pull branch {branch}")


def merge_branch(branch: str) -> None:
    """Merge a branch into main."""
    print(f"Merging branch: {branch}")
    run_command(["git", "merge", branch, "--no-edit"], f"Failed to merge branch {branch}")


def delete_branch(branch: str) -> None:
    """Delete a branch locally and remotely."""
    print(f"Deleting branch: {branch}")
    run_command(["git", "push", "origin", "--delete", branch], f"Failed to delete remote branch {branch}")
    run_command(["git", "branch", "-D", branch], f"Failed to delete local branch {branch}")


def main() -> None:
    """Main function to orchestrate merging copilot branches into main."""
    repo_path = "/opt/repos/ryegate-yield-engine"
    branches_to_merge = [
        "copilot/add-compliance-hooks-e2e-tests",
        "copilot/create-oracle-backend-cli",
        "copilot/create-react-dashboard-phase-3",
        "copilot/fix-ci-failures-financecommander",
        "copilot/fix-github-actions-workflows"
    ]

    # Change to repo directory
    run_command(["cd", repo_path], "Failed to change to repository directory")

    # Ensure we are on main and up-to-date
    checkout_and_pull("main")

    # Fetch latest changes for all branches
    run_command(["git", "fetch", "origin"], "Failed to fetch remote branches")

    # Merge each branch into main
    for branch in branches_to_merge:
        checkout_and_pull(branch)
        checkout_and_pull("main")  # Return to main before merging
        merge_branch(branch)

    # Push merged changes to origin/main
    run_command(["git", "push", "origin", "main"], "Failed to push merged changes to origin/main")

    # Delete merged branches
    for branch in branches_to_merge:
        delete_branch(branch)

    print("All branches merged and deleted successfully.")


if __name__ == "__main__":
    main()
