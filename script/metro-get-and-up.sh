TEMPFILE=`mktemp /tmp/metro-train-XXXXXXXXXXXXX`

if [ -z ${TOKYOMETRO_ACCESS_TOKEN} ]; then
  echo "Please set TOKYOMETRO_ACCESS_TOKEN to environment var."
  exit 1;
fi

curl "https://api.tokyometroapp.jp/api/v2/datapoints?rdf:type=odpt:Train&acl:consumerKey=${TOKYOMETRO_ACCESS_TOKEN}" > $TEMPFILE

if [ ! -f ~/.s3cfg ]; then
  echo "Please run 's3cmd --configure' at first."
  rm $TEMPFILE;
  exit 1;
fi

s3cmd put ${TEMPFILE} s3://metro-life/train/`date +%s`.json
rm $TEMPFILE
