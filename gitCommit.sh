
status="$(git status --porcelain=1 --ignored)"

function convertToFile() {
    local status=$1
    fileStatus=$(echo "$status" \
        | sed -e "s/^ M/# [modified]/" \
        | sed -e "s/^M./ [modified]/" \
        | sed -e "s/^??/# [added]/" \
        | sed -e "s/^A./ [added]/" \
        | sed -e "s/^D./ [deleted]/" \
        | sed -e "s/^C./ [copied]/" \
        | sed -e "s/^R./ [renamed]/" \
        | sed -e "s/^!!/# [ignored]/" \
        )
}

function extractProperties() {
    local status=$1
    IFS=
    commented=$(echo "$status" | grep -P "^ *#")
    if [ "$commented" == "" ]; then
        commented=0
    else
        commented=1
    fi
    state=$(echo "$status" | sed -e "s/.*\(\[.*\]\).*/\1/")
    file=$(echo "$status" | sed -e "s/.*\[.*\]\s*//")
}

tmpFile="$(mktemp git_commit.XXXXXXXXXX)"

IFS=$'\n'
for statusLine in $status; do
    convertToFile $statusLine
    echo "$fileStatus" >> $tmpFile
done
unset IFS
# echo "$modifiedComment"
# echo "$trackedComment"
# echo "$ignoredComment"

EDITOR=$(git config --get core.editor)
if [ "$EDITOR" == "" ]; then
    EDITOR="vim"
fi

$EDITOR $tmpFile

while IFS= read -r line; do
     extractProperties "$line"
     is_commented=$commented
     is_state=$state
     is_file=$file


     convertToFile "$(git status --porcelain=1 --ignored $file)"
     extractProperties "$fileStatus"

     echo ====
     echo $file
     if [ $is_commented -eq 1 ]; then
         if [ $is_commented -ne $commented ]; then
             echo Added comment undo action: $is_state
         else
             echo Is commented: No change
         fi
     else
         if [ $is_commented -ne $commented ]; then
             echo Removed comment do action: $is_state
         elif [ "$is_state" == "$state" ]; then
            echo No change
         else 
            echo "Changed state $state -> $is_state"
         fi
     fi

done < $tmpFile

rm $tmpFile



