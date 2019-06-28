# 测试工具
本测试工具读取hash2.txt 文件，根据文件里的每一行（每一行是一个哈希），从后向前根据这个哈希从localhost:8500 上读取数据，

本测试工具每读取一个文件，会计算从开始读取下载完成的时间，并且计算出出平均的

### 安装



### 使用方法node index.js -h <hashfile> -p <bzzapi>

hashfile 哈希文件，默认为当前目录下的hash2.txt
bzzapi   eswarm的api，默认为http://localhost:8500


