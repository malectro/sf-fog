import {Vector2, Vector3} from 'three';


export function vec2(...args) {
  return new Vector2(...args);
}

export function vec3(...args) {
  return new Vector3(...args);
}

export default function (x = 0, y = 0, z = null) {
  let vec;
  if (z === null) {
    vec = new Vector2(x, y);
  } else {
    vec = new Vector3(x, y, z);
  }
  return vec;
}

