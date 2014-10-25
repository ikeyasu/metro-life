TEMPFILE=`mktemp /tmp/metro-train-XXXXXXXXXXXXX`
curl "https://api.tokyometroapp.jp/api/v2/datapoints?rdf:type=odpt:Train&acl:consumerKey=${TOKYOMETRO_ACCESS_TOKEN}" > $TEMPFILE

if [ ! -f ~/.s3cfg ]; then
  echo "Please run 's3cmd --configure' at first."
  exit 1;
fi

s3cmd put /tmp/metro-train-3Ibk2nHxsQc9h s3://metro-life/train/`date +%s`.json
rm $TEMPFILE
