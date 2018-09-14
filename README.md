# vss-js
Visual Secret Sharing in JS

Visual Secret Sharing (VSS: 視覚的秘密分散) の
JavaScript による実装です。

ブラウザのみで動作します。

[デモサイト](https://y-ishida.github.io/vss-js/index.html)


## 使い方

[デモサイト](https://y-ishida.github.io/vss-js/index.html)
へアクセスして、「ファイルを選択」ボタンを押下します。

ローカルに存在する画像ファイルを選択すると
その画像がVSSされます。

Share 1 と Share 2 が出力結果です。
それぞれ、右クリックして「名前を付けて画像を保存」または、
「画像をコピー」します。
PNG で保存すれば透過設定も反映されます。
その画像を PowerPoint 等に貼り付けて重ね合わせれば、
Binary 画像が復元されます。


## 動作確認済み環境

Chrome 67


## 開発情報

serve.sh を実行することで、
ローカル簡易 HTTP サーバーを起動できます。

**NOTE: lighttpd が必要**


## 参考サイト

http://www.fe.infn.it/u/filimanto/scienza/webkrypto/visualdecryption.pdf
https://www.slideshare.net/valicac/visual-cryptography


