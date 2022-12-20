// デコレータは関数で、特定の方法でクラスで使用する
// 慣習的に一文字目は大文字で
// 引数にはデコレータの対象となるものを
// デコレータはクラスが定義されたときに実行される（インスタンス化よりも先）
function Logger(constructor: Function) {
  console.log("ログ出力中...");
  console.log(constructor);
}

// デコレータとして使う関数名を記述
@Logger
class Person {
  name = "Max";

  constructor() {
    console.log("Personオブジェクトを作成中...")
  }
}

const pers = new Person();

console.log(pers);