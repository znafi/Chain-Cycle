import Principal "mo:base/Principal";
import HashMap "mo:base/HashMap";
import Result "mo:base/Result";
import Error "mo:base/Error";
import Nat "mo:base/Nat";
import Time "mo:base/Time";
import Hash "mo:base/Hash";
import Iter "mo:base/Iter";

actor GTKToken {
    // Types
    type Account = {
        owner: Principal;
        balance: Nat;
        lastActivity: Int;
    };

    type TransactionType = {
        #mint;
        #transfer;
        #burn;
    };

    type Transaction = {
        id: Nat;
        txType: TransactionType;
        from: ?Principal;
        to: ?Principal;
        amount: Nat;
        timestamp: Int;
    };

    // State
    private stable var totalSupply: Nat = 0;
    private stable var nextTxId: Nat = 0;
    
    private let accounts = HashMap.HashMap<Principal, Account>(0, Principal.equal, Principal.hash);
    private let transactions = HashMap.HashMap<Nat, Transaction>(0, Nat.equal, Hash.hash);

    // Constants
    private let INITIAL_SUPPLY: Nat = 1_000_000;
    private let EXCHANGE_RATE: Nat = 100; // 1 ICP = 100 GTK

    // Initialize the token
    public shared(msg) func initialize() : async Result.Result<(), Text> {
        if (totalSupply != 0) {
            return #err("Token already initialized");
        };

        let initialAccount: Account = {
            owner = msg.caller;
            balance = INITIAL_SUPPLY;
            lastActivity = Time.now();
        };

        accounts.put(msg.caller, initialAccount);
        totalSupply := INITIAL_SUPPLY;

        #ok()
    };

    // Get account balance
    public query func balanceOf(owner: Principal) : async Nat {
        switch (accounts.get(owner)) {
            case (?account) { account.balance };
            case null { 0 };
        }
    };

    // Transfer tokens
    public shared(msg) func transfer(to: Principal, amount: Nat) : async Result.Result<(), Text> {
        if (Principal.isAnonymous(to)) {
            return #err("Cannot transfer to anonymous principal");
        };

        switch (accounts.get(msg.caller)) {
            case (?fromAccount) {
                if (fromAccount.balance < amount) {
                    return #err("Insufficient balance");
                };

                let toAccount = switch (accounts.get(to)) {
                    case (?existing) { existing };
                    case null {{
                        owner = to;
                        balance = 0;
                        lastActivity = Time.now();
                    }};
                };

                // Update balances
                accounts.put(msg.caller, {
                    owner = msg.caller;
                    balance = fromAccount.balance - amount;
                    lastActivity = Time.now();
                });

                accounts.put(to, {
                    owner = to;
                    balance = toAccount.balance + amount;
                    lastActivity = Time.now();
                });

                // Record transaction
                let tx: Transaction = {
                    id = nextTxId;
                    txType = #transfer;
                    from = ?msg.caller;
                    to = ?to;
                    amount = amount;
                    timestamp = Time.now();
                };
                transactions.put(nextTxId, tx);
                nextTxId += 1;

                #ok()
            };
            case null {
                #err("Sender account not found");
            };
        }
    };

    // Buy GTK with ICP
    public shared(msg) func buyTokens() : async Result.Result<Nat, Text> {
        // Note: This is a simplified version. In production, you would:
        // 1. Accept ICP payment
        // 2. Calculate GTK amount based on exchange rate
        // 3. Transfer GTK to buyer
        // For now, we'll just mint some tokens for testing

        let amount = 100 * EXCHANGE_RATE; // Simulating purchase of 100 ICP worth of GTK
        
        let account = switch (accounts.get(msg.caller)) {
            case (?existing) { existing };
            case null {{
                owner = msg.caller;
                balance = 0;
                lastActivity = Time.now();
            }};
        };

        accounts.put(msg.caller, {
            owner = msg.caller;
            balance = account.balance + amount;
            lastActivity = Time.now();
        });

        totalSupply += amount;

        let tx: Transaction = {
            id = nextTxId;
            txType = #mint;
            from = null;
            to = ?msg.caller;
            amount = amount;
            timestamp = Time.now();
        };
        transactions.put(nextTxId, tx);
        nextTxId += 1;

        #ok(amount)
    };

    // Query Methods
    public query func getTransaction(id: Nat) : async ?Transaction {
        transactions.get(id)
    };

    public query func getTotalSupply() : async Nat {
        totalSupply
    };
}
