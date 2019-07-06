#!/bin/bash
#tc qdisc add dev eth0 root tbf rate 10mbps latency 50ms burst 2500
set -o errexit
set -o pipefail
set -o nounset

USER=$(whoami)
#ps -ef | grep "run.sh" | awk '{print $2}' | xargs sudo kill -9 ||  true


DATADIR=${DATADIR:-$1}
PASSWORD=""
mkdir -p $DATADIR
if [ $# == 1 ]
then
for line in $(cat $DATADIR/password)
do 
    PASSWORD=${line}
done
else 
    PASSWORD=$2
fi


#if [ "$PASSWORD" == "" ]; then echo "Password must be set, in order to use eswarm non-interactively." && exit 1; fi

#mount file system first

echo $PASSWORD > $DATADIR/password

KEYFILE=`find $DATADIR | grep UTC | head -n 1` || true
if [ ! -f "$KEYFILE" ]; then echo "No keyfile found. Generating..." && /usr/local/cdsc/geth --datadir $DATADIR --password $DATADIR/password account new; fi
KEYFILE=`find $DATADIR | grep UTC | head -n 1` || true
if [ ! -f "$KEYFILE" ]; then echo "Could not find nor generate a BZZ keyfile." && exit 1; else echo "Found keyfile $KEYFILE"; fi

VERSION=`/usr/local/cdsc/eswarm version`
echo "Running Swarm:"
echo $VERSION

export BZZACCOUNT="`echo -n $KEYFILE | tail -c 40`" || true
if [ "$BZZACCOUNT" == "" ]; then echo "Could not parse BZZACCOUNT from keyfile." && exit 1; fi
# tc qdisc add dev eth0 root tbf rate 25kbps latency 50ms burst 2500
echo -e " /usr/local/cdsc/eswarm  --bzzaccount=$BZZACCOUNT --password $DATADIR/password --ipcpath=/home/$USER/bzzd$BZZACCOUNT.ipc --datadir $DATADIR --nodetype 17 --store.size 1000 $@ 2>&1 </dev/null"
/usr/local/cdsc/eswarm  --bzzaccount=$BZZACCOUNT --password $DATADIR/password --port 40399 --bzzport 18503 --ipcpath=/home/$USER/bzzd$BZZACCOUNT.ipc --datadir $DATADIR --nodetype 17 --store.size 1000 $@ 2 >&1 </dev/null

