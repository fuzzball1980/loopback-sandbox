# loopback-sandbox

A repository for reproducing [LoopBack community issues][wiki-issues].

[wiki-issues]: https://github.com/strongloop/loopback/wiki/Reporting-issues

https://github.com/strongloop/loopback/issues/2400

Run node server/server.js

Open API Explorer and login

username: admin
password: 123456789

Execute API Method ProcessMagazine/ProcessMagazine_getMagazineFileInfo with the following parameter

```
{"name":"Edición Mayo","code":"EMAY2016","summary":null,"year":null,"number":null,"sku":null,"free":false,"releaseAt":"2016-05-25T03:00:00.000Z","exportedAt":null,"id":1,"magazineId":1,"createdAt":"2016-05-23T04:21:19.302Z","updatedAt":"2016-06-02T23:38:10.760Z","deletedAt":null,"_isDeleted":false,"uploadId":22,"magazine":{"name":"Parati","code":"PRTI","id":1,"publisherId":1,"createdAt":"2016-05-23T03:57:16.527Z","updatedAt":"2016-05-23T03:57:16.527Z","deletedAt":null,"_isDeleted":false},"upload":{"name":"847cb29b-843a-4a69-9931-b534f58ec903.pdf","originalName":"Polo 60 Sep-Oct.pdf","type":"application/pdf","container":"files","url":"/api/containers/files/download/847cb29b-843a-4a69-9931-b534f58ec903.pdf","id":22,"createdAt":"2016-06-02T23:38:09.164Z","updatedAt":"2016-06-02T23:38:09.164Z","deletedAt":null,"_isDeleted":false}}

```

the console log should shows the JSON object on the beforeRemote Hook including the relations and the output from the method ProcessMagazine.getMagazineFileInfo without the relations