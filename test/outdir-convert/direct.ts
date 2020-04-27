import {imported} from './imported';

type Bar = string;

export default function() {
  const bar: Bar = 'bar';
  console.log(bar);
  imported();
}