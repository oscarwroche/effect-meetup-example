import { pipe } from "effect";
import * as S from "effect/Schema";

export const Name = pipe(S.String, S.brand("Name"));

export type Name = typeof Name.Type;

export const Address = pipe(S.String, S.brand("Address"));

export type Address = typeof Address.Type;

const address: Address = Address.make("52 Avenue Trudaine");

const name: Name = address;

export const Status = S.Literal("Registered", "Verified", "Deleted");

export type Status = typeof Status.Type;
