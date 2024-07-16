#!/bin/bash

# Define the URL and the target directories
URL="https://inside.fifa.com/api/ranking-overview?locale=en&dateId=id14338"
TARGET_DIR="flags"
METADATA_DIR="metadata"

# Create the target directories if they don't exist
mkdir -p "$TARGET_DIR"
mkdir -p "$METADATA_DIR"

# Initialize the index counter
INDEX=1

# Get the data from the URL and extract flag URLs and metadata using jq
curl -s "$URL" | jq -c '.rankings[].rankingItem' | while read -r ITEM; do
  # Extract necessary fields
  FLAG_URL=$(echo "$ITEM" | jq -r '.flag.src')
  COUNTRY_NAME=$(echo "$ITEM" | jq -r '.name')
  COUNTRY_CODE=$(echo "$ITEM" | jq -r '.countryCode')

  # Skip Eritrea (country code ERI)
  if [ "$COUNTRY_CODE" = "ERI" ]; then
    continue
  fi
  
  # Extract the file name from the URL
  FILE_NAME=$(basename "$FLAG_URL")
  
  # Download the flag image
  curl -s "$FLAG_URL" -o "$TARGET_DIR/$FILE_NAME.png"
  
  # Create JSON metadata
  cat <<EOF > "$METADATA_DIR/${COUNTRY_CODE}.json"
{
  "name": "MetaSoccer Land #${INDEX}",
  "description": "MetaSoccer Lands are unique NFTs, each representing one of the 210 FIFA countries. These lands offer exclusive ownership and significant opportunities within the MetaSoccer ecosystem.",
  "image": "https://assets.metasoccer.com/lands/$FILE_NAME.png",
  "attributes": [
    {
      "trait_type": "Country Code",
      "value": "$COUNTRY_CODE"
    },
    {
      "trait_type": "Name",
      "value": "$COUNTRY_NAME"
    }
  ]
}
EOF

  # Increment the index counter
  INDEX=$((INDEX + 1))
done

echo "Flags downloaded to $TARGET_DIR and metadata created in $METADATA_DIR"