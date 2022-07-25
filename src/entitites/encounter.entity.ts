import { v4 } from 'uuid';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Encounter {
  public constructor(init?: Partial<Encounter>) {
    Object.assign(this, init);
  }

  @PrimaryGeneratedColumn()
  id: string = v4();

  @Column()
  troopId: number;

  @Column({ default: 0 })
  weight: number;

  @Column()
  regionSet: Array<number>;
}
