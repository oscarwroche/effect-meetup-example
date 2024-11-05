import { Arbitrary, FastCheck, pipe } from "effect";
import * as S from "effect/Schema";

// Branded Types

export const Name = pipe(S.String, S.brand("Name"));

export type Name = typeof Name.Type;

export const Address = pipe(S.String, S.brand("Address"));

export type Address = typeof Address.Type;

const address: Address = Address.make("52 Avenue Trudaine");

// TYPE ERROR
// const name: Name = address;

// Union Types / Optionals

enum Status {
  Created = "Created",
  Verified = "Verified",
  Deleted = "Deleted",
}

const CreatedAccount = S.Struct({
  name: Name,
  status: S.Literal(Status.Created),
});

const VerifiedAccount = S.Struct({
  name: Name,
  address: S.OptionFromNullOr(Address),
  status: S.Literal(Status.Verified),
});

const DeletedAccount = S.Struct({
  name: Name,
  status: S.Literal(Status.Deleted),
});

const Account = S.Union(CreatedAccount, VerifiedAccount, DeletedAccount);

export type Account = typeof Account.Type;

// Classes

export class CreatedAccountClass extends S.Class<CreatedAccountClass>(
  "CreatedAccountClass",
)({ name: Name, status: S.Literal(Status.Created) }) {
  static create = ({ name }: { name: Name }) => {
    new CreatedAccountClass({ name, status: Status.Created });
  };
}

export class VerifiedAccountClass extends S.Class<VerifiedAccountClass>(
  "VerifiedAccountClass",
)({
  name: Name,
  status: S.Literal(Status.Verified),
  address: S.OptionFromNullOr(Address),
}) {
  static create = ({
    name,
    address,
  }: {
    name: Name;
    address: Address | null;
  }) => {
    new VerifiedAccountClass({
      name,
      status: Status.Verified,
      address: S.decodeSync(S.OptionFromNullOr(Address))(address),
    });
  };
}

export class DeletedAccountClass extends S.Class<DeletedAccountClass>(
  "DeletedAccountClass",
)({ name: Name, status: S.Literal(Status.Deleted) }) {
  static create = ({ name }: { name: Name }) => {
    new DeletedAccountClass({ name, status: Status.Deleted });
  };
}

export const AccountClass = S.Union(
  CreatedAccountClass,
  VerifiedAccountClass,
  DeletedAccountClass,
);

// Classes with Lifecycle Methods

export class CreatedAccountClassWithLifecycle extends S.Class<CreatedAccountClassWithLifecycle>(
  "CreatedAccountClassWithLifecycle",
)({ name: Name, status: S.Literal(Status.Created) }) {
  static create = ({ name }: { name: Name }) => {
    new CreatedAccountClassWithLifecycle({ name, status: Status.Created });
  };
}

export class VerifiedAccountClassWithLifecycle extends S.Class<VerifiedAccountClassWithLifecycle>(
  "VerifiedAccountClassWithLifecycle",
)({
  name: Name,
  status: S.Literal(Status.Verified),
  address: S.OptionFromNullOr(Address),
}) {
  static fromCreatedAccount =
    ({ address }: { address: Address | null }) =>
    (createdAccount: CreatedAccountClassWithLifecycle) => {
      new VerifiedAccountClassWithLifecycle({
        ...createdAccount,
        status: Status.Verified,
        address: S.decodeSync(S.OptionFromNullOr(Address))(address),
      });
    };
}

export class DeletedAccountClassWithLifecycle extends S.Class<DeletedAccountClassWithLifecycle>(
  "DeletedAccountClassWithLifecycle",
)({ name: Name, status: S.Literal(Status.Deleted) }) {
  static fromCreatedAccount = (
    verifiedAccount: VerifiedAccountClassWithLifecycle,
  ) => {
    new DeletedAccountClassWithLifecycle({
      name: verifiedAccount.name,
      status: Status.Deleted,
    });
  };

  static fromVerifiedAccount = (
    verifiedAccount: VerifiedAccountClassWithLifecycle,
  ) => {
    new DeletedAccountClassWithLifecycle({
      name: verifiedAccount.name,
      status: Status.Deleted,
    });
  };
}

export const AccountClassWithLifecycle = S.Union(
  CreatedAccountClassWithLifecycle,
  VerifiedAccountClassWithLifecycle,
  DeletedAccountClassWithLifecycle,
);

// Decoding

export const newAccountOK = S.decodeSync(AccountClassWithLifecycle)({
  name: "Oscar",
  status: Status.Created,
});

// TYPE ERROR
// export const newAccountNotOK = S.decodeSync(AccountClassWithLifecycle)({
//   name: "Oscar",
//   status: Status.Verified,
// });

const AccountClassWithLifeCycleArbitraryType = Arbitrary.make(
  AccountClassWithLifecycle,
);

console.log(FastCheck.sample(AccountClassWithLifeCycleArbitraryType, 2));

const SmallName = Name.annotations({
  arbitrary: () => (fc) =>
    fc.stringMatching(/^[a-zA-Z]{3}$/).map((s) => s as Name),
});

const SmallNameArbitraryType = Arbitrary.make(SmallName);

console.log(FastCheck.sample(SmallNameArbitraryType, 5));
