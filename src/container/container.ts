import 'reflect-metadata';

export type Constructor<T = any> = new (...args: any[]) => T;
export type Dependency<T = any> = Constructor<T> | T;

class Container {
  private static instance: Container;
  private dependencies: Map<string, Constructor<any>>;
  private resolutionCache: Map<Dependency<any>, boolean>;
  private instantiatedCache: Map<string, Dependency>;

  private constructor() {
    this.dependencies = new Map<string, Constructor<any>>();
    this.resolutionCache = new Map<Dependency<any>, boolean>();
    this.instantiatedCache = new Map<string, Dependency>();
  }

  static getInstance(): Container {
    if (!Container.instance) {
      Container.instance = new Container();
    }
    return Container.instance;
  }

  set<T>(dependency: Constructor<T>) {
    this.dependencies.set(dependency.name, dependency);
  }

  get<T>(type: Constructor<T>): T {
    let dependency = this.instantiatedCache.get(type.name);
    if (dependency) {
      return dependency;
    }
    dependency = this.dependencies.get(type.name);
    if (!dependency) {
      throw new Error(`Dependency '${name}' not found.`);
    }

    try {
      const preppedClass = this.resolveDependency(dependency);
      this.instantiatedCache.set(preppedClass.name, preppedClass);
      return preppedClass;
    } finally {
      this.resolutionCache.clear();
    }
  }

  private resolveDependency<T>(dependency: Dependency<T>): T {
    this.checkForCircularDependency(dependency);

    if (dependency instanceof Function) {
      return this.instantiateClass(dependency);
    }

    this.resolutionCache.delete(dependency);
    return dependency;
  }

  private instantiateClass<T>(constructor: Constructor<T>): T {
    console.log({ constructor: constructor.prototype });
    const constructorParams =
      Reflect.getMetadata('design:paramtypes', constructor) || [];
    console.log(constructorParams);
    const resolvedParams = constructorParams.map((param: any) =>
      this.resolveDependency(param)
    );
    return new constructor(...resolvedParams);
  }

  private checkForCircularDependency<T = any>(dependency: Dependency<T>): void {
    if (this.resolutionCache.has(dependency)) {
      throw new Error(`Circular dependency detected: ${dependency}`);
    }

    this.resolutionCache.set(dependency, true);
  }
}

export { Container };
