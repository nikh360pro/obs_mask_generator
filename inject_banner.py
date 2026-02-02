#!/usr/bin/env python3
"""
Inject banner placeholder and components.js script into all HTML files
in obs_mask_generator folder (except video-background-remover pages)
"""

import os
import re
from pathlib import Path

# Root directory
ROOT = Path(r"d:\xyz\New folder\Bg_remover_2\obs_mask_generator")

# Exclude video-background-remover folder (the tool itself)
EXCLUDE_FOLDER = "video-background-remover"

# HTML to inject after <body> tag
BANNER_PLACEHOLDER = '    <!-- Global Banner (Promotes Video Background Remover) -->\n    <div id="global-banner"></div>\n\n'

# CSS link to inject in <head>
CSS_LINK = '    <link rel="stylesheet" href="/banner.css">\n'

# Script tag to inject before </body>
SCRIPT_TAG = '    <script src="/components.js"></script>\n'

def should_process(file_path: Path) -> bool:
    """Check if file should be processed"""
    # Skip if in video-background-remover folder
    if EXCLUDE_FOLDER in str(file_path):
        return False

    # Only process HTML files
    if file_path.suffix != '.html':
        return False

    return True

def inject_banner_placeholder(html_content: str) -> tuple[str, bool]:
    """Inject banner placeholder after <body> tag if not already present"""
    # Check if already injected
    if 'id="global-banner"' in html_content:
        return html_content, False

    # Find <body> tag (case insensitive, handles attributes)
    body_pattern = re.compile(r'(<body[^>]*>)', re.IGNORECASE)
    match = body_pattern.search(html_content)

    if not match:
        return html_content, False

    # Insert placeholder after <body>
    body_tag = match.group(1)
    insertion_point = match.end()

    new_content = (
        html_content[:insertion_point] +
        '\n' + BANNER_PLACEHOLDER +
        html_content[insertion_point:]
    )

    return new_content, True

def inject_css_link(html_content: str) -> tuple[str, bool]:
    """Inject banner.css link in <head> if not already present"""
    # Check if already injected
    if '/banner.css' in html_content or 'banner.css' in html_content:
        return html_content, False

    # Find </head> tag (case insensitive)
    head_close_pattern = re.compile(r'(</head>)', re.IGNORECASE)
    match = head_close_pattern.search(html_content)

    if not match:
        return html_content, False

    # Insert CSS before </head>
    insertion_point = match.start()

    new_content = (
        html_content[:insertion_point] +
        CSS_LINK +
        html_content[insertion_point:]
    )

    return new_content, True

def inject_script_tag(html_content: str) -> tuple[str, bool]:
    """Inject components.js script before </body> tag if not already present"""
    # Check if already injected
    if '/components.js' in html_content or 'components.js' in html_content:
        return html_content, False

    # Find </body> tag (case insensitive)
    body_close_pattern = re.compile(r'(</body>)', re.IGNORECASE)
    match = body_close_pattern.search(html_content)

    if not match:
        return html_content, False

    # Insert script before </body>
    insertion_point = match.start()

    new_content = (
        html_content[:insertion_point] +
        SCRIPT_TAG +
        html_content[insertion_point:]
    )

    return new_content, True

def process_file(file_path: Path) -> dict:
    """Process a single HTML file"""
    result = {
        'file': str(file_path.relative_to(ROOT)),
        'css_injected': False,
        'placeholder_injected': False,
        'script_injected': False,
        'error': None
    }

    try:
        # Read file
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()

        original_content = content

        # Inject CSS link in <head>
        content, css_added = inject_css_link(content)
        result['css_injected'] = css_added

        # Inject banner placeholder after <body>
        content, placeholder_added = inject_banner_placeholder(content)
        result['placeholder_injected'] = placeholder_added

        # Inject script tag before </body>
        content, script_added = inject_script_tag(content)
        result['script_injected'] = script_added

        # Write back if changed
        if content != original_content:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)

    except Exception as e:
        result['error'] = str(e)

    return result

def main():
    print("=" * 80)
    print("INJECTING BANNER SYSTEM INTO ALL OBS MASK GENERATOR PAGES")
    print("=" * 80)
    print()

    # Find all HTML files
    html_files = list(ROOT.rglob('*.html'))
    print(f"Found {len(html_files)} HTML files")

    # Filter files to process
    files_to_process = [f for f in html_files if should_process(f)]
    print(f"Processing {len(files_to_process)} files (excluding {EXCLUDE_FOLDER})")
    print()

    # Process files
    results = []
    for i, file_path in enumerate(files_to_process, 1):
        result = process_file(file_path)
        results.append(result)

        # Progress indicator
        if i % 50 == 0:
            print(f"Progress: {i}/{len(files_to_process)} files processed...")

    print()
    print("=" * 80)
    print("SUMMARY")
    print("=" * 80)

    # Count results
    css_added = sum(1 for r in results if r['css_injected'])
    placeholder_added = sum(1 for r in results if r['placeholder_injected'])
    script_added = sum(1 for r in results if r['script_injected'])
    errors = [r for r in results if r['error']]

    print(f"✓ CSS link injected: {css_added} files")
    print(f"✓ Placeholder injected: {placeholder_added} files")
    print(f"✓ Script tag injected: {script_added} files")
    print(f"✗ Errors: {len(errors)} files")

    if errors:
        print("\nErrors:")
        for result in errors[:10]:  # Show first 10 errors
            print(f"  - {result['file']}: {result['error']}")

    print()
    print("✅ Done! Banner system injected into all pages.")
    print(f"   Banner will show on all {len(files_to_process)} pages")
    print(f"   EXCEPT video-background-remover pages (excluded)")

if __name__ == '__main__':
    main()
