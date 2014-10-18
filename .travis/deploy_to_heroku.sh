# See http://www.parsed.io/yeoman-travis-ci-heroku/
# You need to set HEROKU_API_KEY env on travis-ci.org web on first run.

git config --global user.email "metro-life-dev@googlegroups.com"
git config --global user.name "metro-life-admin"
echo "Host heroku.com" >> ~/.ssh/config
echo "   StrictHostKeyChecking no" >> ~/.ssh/config
echo "   CheckHostIP no" >> ~/.ssh/config; 
echo "   UserKnownHostsFile=/dev/null" >> ~/.ssh/config;
if [[ $TRAVIS_PULL_REQUEST == "false" && $TRAVIS_BRANCH == "master" ]]
  then 
    gem install heroku
    echo yes | heroku keys:add
    echo yes | grunt buildcontrol:heroku
    heroku keys:remove `cat ~/.ssh/id_rsa.pub | cut -d " " -f  3`
fi
echo
echo "...done."

