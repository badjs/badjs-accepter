forever stop app.js
echo "stop current ."
# git pull
# echo "git update"
forever -o ./log/log.log -e ./log/err.log start app.js
