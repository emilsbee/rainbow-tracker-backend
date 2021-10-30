yarn run test
if [ $? -eq 0 ]; then
    git push origin main
else
    echo Tests failed :(
fi
