#!/usr/bin/env bash

# update.sh
# Copies the modified files in the friendchat/client directory to
# the proper location in Friend build directory structure.

# Edit this line if your Friend directory is not the same as this one
echo "updating client, path: $FRIEND"

# Creates destination directory if it does not exist
if [ ! -d "$FRIEND/build/resources/webclient/apps/FriendChat" ]; then
    mkdir "$FRIEND/build/resources/webclient/apps/FriendChat"
fi

# Copy the files
echo "Copying files to $FRIEND directory."
rsync -ravl \
	--exclude '/.git*' \
	--exclude '/update.sh' \
	--exclude '/install.sh' \
	--exclude '/readme.txt' \
	. "$FRIEND/build/resources/webclient/apps/FriendChat"

# End
echo ""
echo "Update successfully completed."
echo ""
