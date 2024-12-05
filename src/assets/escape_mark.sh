#!/bin/bash

# Function to escape special characters for SQL insertion
escape_markdown() {
    local input="$1"
    
    # Escape single quotes, backslashes, double quotes, and backticks
    local escaped=$(echo "$input" | sed -e "s/'/''/g" -e 's/\\/\\\\/g' -e 's/"/\\"/g' -e 's/`/\\`/g')  

    echo "$escaped"
}

# Check if both input and output files are provided
if [ -z "$1" ] || [ -z "$2" ]; then
    echo "Usage: $0 <input-markdown-file> <output-file>"
    exit 1
fi

input_file="$1"
output_file="$2"

# Check if input file exists
if [ ! -f "$input_file" ]; then
    echo "Error: Input file '$input_file' not found!"
    exit 1
fi

# Read the Markdown content from the input file
markdown_content=$(cat "$input_file")

# Escape the Markdown content
escaped_content=$(escape_markdown "$markdown_content")

# Write the escaped content to the output file
echo "$escaped_content" > "$output_file"

echo "Escaped content has been written to '$output_file'"

