// デコレータは関数で、特定の方法でクラスで使用する
// 慣習的に一文字目は大文字で
// (引数名: デコレータの対象となるもの)
// デコレータはクラスが定義されたときに実行される（インスタンス化よりも先）
function Logger(log: string) {
  console.log("Logger ファクトリ");
  //匿名関数
  return function (constructor: Function) {
    console.log(log);
    console.log(constructor);
  }
}

function WithTemplate(template: string, hookId: string) {
  console.log("WithTemplate ファクトリ");
  return function <T extends { new(...args: any[]): { name: string } }>(originalConstructor: T) {
    return class extends originalConstructor {
      constructor(..._: any[]) {
        super();
        console.log("テンプレートを表示");
        const hookEl = document.getElementById(hookId);
        if (hookEl) {
          hookEl.innerHTML = template;
          hookEl.querySelector('h1')!.textContent = this.name;
        }
      }
    }
  }
}

// デコレータとして使う関数名を指定
@Logger("ログ出力中...")
@WithTemplate("<h1>Personオブジェクト</h1>", "app")
class Person {
  name = "Max";

  constructor() {
    console.log("Personオブジェクトを作成中...")
  }
}

const pers = new Person();

console.log(pers);

// --------------------------------------------------------------

function Log(target: any, propertyName: string | symbol) {
  console.log('Property デコレータ');
  console.log(target, propertyName)
}

function Log2(target: any, name: string, descriptor: PropertyDecorator) {
  console.log('Accessor デコレータ');
  console.log(target);
  console.log(name);
  console.log(descriptor);
}

function Log3(target: any, name: string | symbol, descriptor: PropertyDecorator) {
  console.log('Method デコレータ');
  console.log(target);
  console.log(name);
  console.log(descriptor);
}

function Log4(target: any, name: string | symbol, position: number) {
  console.log('Parameter デコレータ');
  console.log(target);
  console.log(name);
  console.log(position);
}


class Product {
  @Log
  title: string;
  private _price: number;

  // @Log2
  set price(val: number) {
    if (val > 0) {
      this._price = val;
    } else {
      throw new Error('不正な価格です - 0以下は設定できません');
    }
  }

  constructor(t: string, p: number) {
    this.title = t;
    this._price = p;
  }

  // @Log3
  getPriceWidthTax(@Log4 tax: number) {
    return this._price * (1 + tax);
  }
}

const p1 = new Product('Book1', 100);
const p2 = new Product('Book2', 200);

// ------------------------------------------------------------

function Autobind(_: any, _2: string, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value;
  const adjDescriptor: PropertyDescriptor = {
    configurable: true,
    enumerable: false,
    get() {
      const boundFn = originalMethod.bind(this);
      return boundFn;
    }
  }
  return adjDescriptor;
}


class Printer {
  message = 'クリックしました!';

  @Autobind
  showMessage() {
    console.log(this.message);
  }
}

const p = new Printer();

const button = document.querySelector('button')!;
button.addEventListener('click', p.showMessage);

// ------------------------------------------------------------

interface ValidatorConfig {
  //キーは文字列型 : 値はオブジェクト
  [prop: string]: {
    //キーは文字列型 : 値は文字列型の配列
    [validatableProp: string]: string[]; //['required', 'positive']
  }
}

//ValidatorConfigの値を持ったオブジェクトを定義
const registeredValidators: ValidatorConfig = {}

function Required(target: any, propName: string) {
  registeredValidators[target.constructor.name] = { //target.constructor.nameにはクラス名が入る
    ...registeredValidators[target.constructor.name],
    [propName]: ['required'],
  }
}

function PositiveNumber(target: any, propName: string) {
  registeredValidators[target.constructor.name] = {
    ...registeredValidators[target.constructor.name],
    [propName]: ['positive'],
  }
}

function validate(obj: any) {
  const objValidatorConfig = registeredValidators[obj.constructor.name];
  if (!objValidatorConfig) {
    return true;
  }
  let isValid = true;
  for (const prop in objValidatorConfig) {
    for (const validator of objValidatorConfig[prop]) {
      switch (validator) {
        case 'required':
          isValid = isValid && !!obj[prop];
          break;
        case 'positive':
          isValid = isValid && obj[prop] > 0;
          break;
      }
    }
  }
  return isValid;
}

class Course {
  @Required
  title: string;

  @PositiveNumber
  price: number;

  constructor(t: string, p: number) {
    this.title = t;
    this.price = p;
  }
}

const courseForm = document.querySelector('form')!;
courseForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const titleEl = document.getElementById('title') as HTMLInputElement;
  const priceEl = document.getElementById('price') as HTMLInputElement;

  const title = titleEl.value;
  const price = +priceEl.value; //valueプロパティは文字列型のため、+ をつけて数値型にキャスト

  const createdCourse = new Course(title, price);

  if (!validate(createdCourse)) {
    alert('正しく入力してください');
    return;
  }
  console.log(createdCourse);
})