import {imported} from './imported';
import {manager} from './imported.manager';

type Bar = string;

export default function() {
  const bar: Bar = 'bar';
  console.log(bar);
  imported();
  manager();
}