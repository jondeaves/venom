export enum GameState {
  Playing = 1,
  Finished = 2,
  GivenUp = 3,
}

export enum MovementDirection {
  North = 'n',
  East = 'e',
  South = 's',
  West = 'w',
}

export const AllMovementDirections = [
  MovementDirection.North,
  MovementDirection.East,
  MovementDirection.South,
  MovementDirection.West,
];

export function parseMovementArg(arg: string): Array<[MovementDirection, number]> {
  const moves = arg.split(/(?![0-9])+/);
  return moves.reduce<Array<[MovementDirection, number]>>((all, cur) => {
    const [direction, amountStr] = cur.split(/(?![a-z]+)/i);
    const amount = Number(amountStr ?? '1');

    return [...all, [direction as MovementDirection, amount]] as Array<[MovementDirection, number]>;
  }, []);
}
