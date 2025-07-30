export interface Pointer {
  field: string
  value?: any
}

export interface Path {
  pointers: Pointer[]
}

export interface Patch {
  path: Path
  value?: any
}

export function patch(source: any, path: Path, value?: any) {
  const pathToTarget = path.pointers.slice(0, path.pointers.length - 1)

  const target = getTarget(source, pathToTarget)
  if (!target) {
    console.warn('Unable to find target', pointersToString(pathToTarget), source)
    return
  }

  const pointer = path.pointers[path.pointers.length - 1]

  assignToTarget(target, pointer, value)
}

function assignToTarget(target: any, pointer: Pointer, value: any) {
  if (Array.isArray(target)) {
    const index = target.findIndex((it) => it[pointer.field] === pointer.value)
    if (index > -1) {
      if (!value) {
        target.splice(index, 1)
      } else {
        target[index] = value
      }
    } else {
      target.push(value)
    }
    return
  }

  if (typeof target === 'object') {
    target[pointer.field] = value
    return
  }

  console.warn('Unable to assign value to target', pointersToString([pointer]), target)
}

function getTarget(source: any, pointers: Pointer[]): any | null {
  let node = source

  for (const pointer of pointers) {
    if (!node) {
      return null
    } else if (Array.isArray(node)) {
      node = node.find((it) => it[pointer.field] === pointer.value)
      continue
    } else if (typeof node === 'object') {
      node = node[pointer.field]
      continue
    }
    return null
  }

  return node
}

function pointersToString(pointers: Pointer[]) {
  return '/' + pointers.map((it) => (!!it.value ? `${it.field}=${it.value}` : it)).join('/')
}
