import { types, flow } from "mobx-state-tree";

const ClientTransactionStore = types
  .model("ClientTransactionStore", {
    selectedMethod: types.string,
    depositAddress: types.maybeNull(types.string),
    amount: types.optional(types.string, ""),
    donerId: types.optional(types.string, ""),
    userConfirmed: types.optional(types.boolean, false),
    txId: types.optional(types.string, ""),
  })
  .actions((self) => ({
    setSelectedMethod(method: string) {
      self.selectedMethod = method;
      self.userConfirmed = false;
    },
    setAmount(value: string) {
      self.amount = value;
    },
    setDonerId(value: string) {
      self.donerId = value;
    },
    confirmUser() {
      self.userConfirmed = true;
    },
    setTransactionId(txId: string) {
      self.txId = txId;
    },
    setDepositAddress(address: string) {
      self.depositAddress = address;
    },
    resetTransaction() {
      self.txId = "";
      self.depositAddress = null;
      self.userConfirmed = false;
    },
    prepareTransaction: flow(function* () {
      if (!self.amount || !self.donerId || parseInt(self.amount) <= 0) {
        throw new Error("Invalid donation data");
      }
      const currency = self.selectedMethod.toLowerCase();

      try {
        const response = yield fetch("/api/tx", {
          method: "POST",
          body: ["PREPARE_TX", self.donerId, currency, self.amount]
            .join(",")
            .trim(),
        });
        if (!response.ok) throw new Error("Failed to prepare transaction");

        const txData = yield response.json();
        let finalDepositAddress = txData.depositAddress;

        if (currency === "ethereum") {
          finalDepositAddress = "0x" + finalDepositAddress;
        }

        self.setTransactionId(txData.txKey);
        self.setDepositAddress(finalDepositAddress);
        self.confirmUser();
      } catch (error) {
        console.error("Transaction preparation failed:", error);
        throw error;
      }
    }),
  }));

export default ClientTransactionStore.create({
  selectedMethod: "Ethereum",
  depositAddress: null,
  amount: "",
  donerId: "",
  userConfirmed: false,
  txId: "",
});
