# 微型 Lisp 直譯器

以 TypeScript 撰寫，參考王垠的「怎樣寫一個解釋器」

目前語法為 scheme 的一個極小子集


# 使用

``` bash
yarn # 安裝依賴
yarn run test # 測試
yarn run build # 將 TypeScript 編譯至 build/ 目錄下
yarn run lispi <filename.scm> # 直譯 <filename.scm>
```