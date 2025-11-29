#!/usr/bin/env python3
"""
Repository cleanup and organization script for the beta coefficient project.

This script performs the following cleanup tasks:
1. Removes duplicate virtual environments
2. Organizes model outputs
3. Standardizes folder naming
4. Creates proper directory structure
5. Cleans up unused files
"""

import os
import shutil
import subprocess
from pathlib import Path
import argparse


def main():
    parser = argparse.ArgumentParser(description='Clean up and organize the repository')
    parser.add_argument('--dry-run', action='store_true', help='Show what would be done without making changes')
    parser.add_argument('--project-root', default='.', help='Path to project root directory')
    args = parser.parse_args()

    project_root = Path(args.project_root).resolve()
    print(f"Cleaning up repository at: {project_root}")

    if args.dry_run:
        print("DRY RUN MODE - No changes will be made")
        print("=" * 50)

    # Task 1: Clean up duplicate virtual environments
    cleanup_virtual_environments(project_root, args.dry_run)
    
    # Task 2: Organize data analysis folder
    organize_data_analysis(project_root, args.dry_run)
    
    # Task 3: Clean up documentation
    organize_documentation(project_root, args.dry_run)
    
    # Task 4: Set up proper backend structure
    setup_backend_structure(project_root, args.dry_run)
    
    # Task 5: Create scripts directory
    create_scripts_directory(project_root, args.dry_run)
    
    print("\n" + "=" * 50)
    print("Repository cleanup completed!")
    

def cleanup_virtual_environments(project_root: Path, dry_run: bool):
    """Remove duplicate virtual environments in backend folder."""
    print("\n1. Cleaning up virtual environments...")
    
    backend_dir = project_root / "backend"
    if not backend_dir.exists():
        print("   Backend directory not found, skipping...")
        return
    
    # Remove duplicate venv folders
    venv_dirs = [
        backend_dir / "venv",
        backend_dir / ".venv"
    ]
    
    for venv_dir in venv_dirs:
        if venv_dir.exists():
            print(f"   {'Would remove' if dry_run else 'Removing'}: {venv_dir}")
            if not dry_run:
                shutil.rmtree(venv_dir)
    
    print("   ✓ Virtual environment cleanup completed")


def organize_data_analysis(project_root: Path, dry_run: bool):
    """Organize the Data Analysis folder and standardize naming."""
    print("\n2. Organizing data analysis folder...")
    
    old_dir = project_root / "Data Analysis"
    new_dir = project_root / "data_analysis"
    
    if old_dir.exists() and not new_dir.exists():
        print(f"   {'Would rename' if dry_run else 'Renaming'}: '{old_dir.name}' -> '{new_dir.name}'")
        if not dry_run:
            old_dir.rename(new_dir)
    
    # Organize model files
    if new_dir.exists():
        model_files = [
            "josh's model.py",
            "bcoefficient_production_level_code_patched.py"
        ]
        
        for file_name in model_files:
            old_file = new_dir / file_name
            if old_file.exists() and " " in file_name:
                new_file = new_dir / file_name.replace(" ", "_").replace("'", "")
                print(f"   {'Would rename' if dry_run else 'Renaming'}: {file_name} -> {new_file.name}")
                if not dry_run:
                    old_file.rename(new_file)
    
    print("   ✓ Data analysis folder organized")


def organize_documentation(project_root: Path, dry_run: bool):
    """Organize documentation files."""
    print("\n3. Organizing documentation...")
    
    docs_dir = project_root / "docs"
    if not docs_dir.exists():
        print(f"   {'Would create' if dry_run else 'Creating'}: docs directory")
        if not dry_run:
            docs_dir.mkdir()
    
    # Move documentation files to docs folder
    doc_files = [
        "CLIENT_MEETING_GUIDE.md",
        "DOCUMENTATION.md", 
        "DUAL_MODEL_ARCHITECTURE.md",
        "FAQ_TROUBLESHOOTING.md",
        "IMPLEMENTATION_COMPLETE.md",
        "TECHNICAL_GUIDE.md"
    ]
    
    for doc_file in doc_files:
        old_path = project_root / doc_file
        new_path = docs_dir / doc_file
        
        if old_path.exists() and not new_path.exists():
            print(f"   {'Would move' if dry_run else 'Moving'}: {doc_file} -> docs/")
            if not dry_run:
                shutil.move(str(old_path), str(new_path))
    
    print("   ✓ Documentation organized")


def setup_backend_structure(project_root: Path, dry_run: bool):
    """Ensure proper backend directory structure."""
    print("\n4. Setting up backend structure...")
    
    backend_dir = project_root / "backend"
    if not backend_dir.exists():
        print("   Backend directory not found, skipping...")
        return
    
    # Create necessary directories
    required_dirs = [
        backend_dir / "webapp" / "management",
        backend_dir / "webapp" / "management" / "commands",
        backend_dir / "static",
        backend_dir / "media",
        backend_dir / "logs"
    ]
    
    for dir_path in required_dirs:
        if not dir_path.exists():
            print(f"   {'Would create' if dry_run else 'Creating'}: {dir_path.relative_to(project_root)}")
            if not dry_run:
                dir_path.mkdir(parents=True, exist_ok=True)
    
    print("   ✓ Backend structure verified")


def create_scripts_directory(project_root: Path, dry_run: bool):
    """Create and organize scripts directory."""
    print("\n5. Creating scripts directory...")
    
    scripts_dir = project_root / "scripts"
    if not scripts_dir.exists():
        print(f"   {'Would create' if dry_run else 'Creating'}: scripts directory")
        if not dry_run:
            scripts_dir.mkdir()
    
    # Create useful script templates
    scripts = {
        "run_beta_model.py": '''#!/usr/bin/env python3
"""
Script to run beta coefficient model and update database.
"""
import os
import sys
import subprocess
from pathlib import Path

def main():
    project_root = Path(__file__).parent.parent
    data_analysis_dir = project_root / "data_analysis"
    backend_dir = project_root / "backend"
    
    # Run the beta coefficient model
    print("Running beta coefficient model...")
    model_script = data_analysis_dir / "bcoefficient_production_level_code_patched.py"
    
    if model_script.exists():
        subprocess.run([sys.executable, str(model_script)], cwd=data_analysis_dir)
        print("Model execution completed.")
        
        # Import results to database
        print("Importing results to database...")
        os.chdir(backend_dir)
        subprocess.run([sys.executable, "manage.py", "import_beta_data"])
        print("Database import completed.")
    else:
        print(f"Model script not found: {model_script}")

if __name__ == "__main__":
    main()
''',
        
        "setup_environment.py": '''#!/usr/bin/env python3
"""
Setup script for development environment.
"""
import subprocess
import sys
from pathlib import Path

def main():
    project_root = Path(__file__).parent.parent
    backend_dir = project_root / "backend"
    frontend_dir = project_root / "frontend"
    
    print("Setting up development environment...")
    
    # Backend setup
    if backend_dir.exists():
        print("Setting up backend...")
        subprocess.run([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"], 
                      cwd=backend_dir)
        subprocess.run([sys.executable, "manage.py", "migrate"], cwd=backend_dir)
    
    # Frontend setup
    if frontend_dir.exists():
        print("Setting up frontend...")
        subprocess.run(["npm", "install"], cwd=frontend_dir)
    
    print("Environment setup completed!")

if __name__ == "__main__":
    main()
''',
        
        "deploy.py": '''#!/usr/bin/env python3
"""
Deployment script for the beta coefficient application.
"""
import subprocess
import sys
from pathlib import Path

def main():
    project_root = Path(__file__).parent.parent
    
    print("Deploying application...")
    
    # Build frontend
    print("Building frontend...")
    subprocess.run(["npm", "run", "build"], cwd=project_root / "frontend")
    
    # Collect static files for backend
    print("Collecting static files...")
    subprocess.run([sys.executable, "manage.py", "collectstatic", "--noinput"], 
                  cwd=project_root / "backend")
    
    print("Deployment completed!")

if __name__ == "__main__":
    main()
'''
    }
    
    for script_name, content in scripts.items():
        script_path = scripts_dir / script_name
        if not script_path.exists():
            print(f"   {'Would create' if dry_run else 'Creating'}: scripts/{script_name}")
            if not dry_run:
                script_path.write_text(content)
                script_path.chmod(0o755)  # Make executable
    
    print("   ✓ Scripts directory created")


if __name__ == "__main__":
    main()