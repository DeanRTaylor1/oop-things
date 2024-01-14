import 'reflect-metadata';
import { Constructor, Container } from './container';

function Register(): ClassDecorator {
  return (target: Function) => {
    console.log({ target });
    const data = Reflect.getOwnMetadata('design:paramtypes', target);
    console.log({ data });
    container.set(target as Constructor);
  };
}
const container = Container.getInstance();

class TestClass2 {
  property: string;
  constructor() {
    this.property = 'I am test class 2';
  }
}

@Register()
class TestClass {
  property: string;
  constructor(private testClass2: TestClass2) {
    this.property = 'hello world';
    console.log(this.testClass2.property);
  }
}

const testClass = container.get<TestClass>(TestClass);
// console.log(testClass.property);
