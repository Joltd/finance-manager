export class Reference {
  id!: string
  name!: string
  deleted: boolean = false

  constructor(id: string, name: string) {
    this.id = id;
    this.name = name;
  }
}
