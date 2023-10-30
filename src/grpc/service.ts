import { z } from "zod";
import { WalletManagerGRPCService } from "./service-impl";
import { createServer } from "nice-grpc";
import { WalletManagerGRPCServiceDefinition } from "./out/wallet-manager-grpc-service";
import * as fs from "fs";
import {
  WalletManager,
  WalletManagerConfigSchema,
  WalletManagerGRPCConfigSchema,
  WalletManagerOptionsSchema,
} from "../wallet-manager";

const grpcServerSchema = z.object({
  listeningAddress: z.string().default("0.0.0.0"),
  listeningPort: z.number().default(50051),
});

function readConfig() {
  const filePath = "/etc/wallet-manager/config.json";
  const fileData = fs.readFileSync(filePath, "utf-8");
  const parsedData = JSON.parse(fileData);

  const schema = z.object({
    config: WalletManagerConfigSchema,
    options: WalletManagerOptionsSchema.optional(),
    grpc: WalletManagerGRPCConfigSchema,
  });

  return schema.parse(parsedData);
}

const fileConfig = readConfig();

const walletManager = new WalletManager(fileConfig.config, fileConfig.options);

const walletManagerGRPCService = new WalletManagerGRPCService(walletManager);

const server = createServer(); // TODO: add observability for the GRPC server
server.add(WalletManagerGRPCServiceDefinition, walletManagerGRPCService);
server.listen(fileConfig.grpc.listenAddress + ":" + fileConfig.grpc.listenPort);

// FIXME: This only handles the signal sent by docker. It does not handle keyboard interrupts.
process.on("SIGTERM", function () {
  console.log("Shutting down service...");
  // Starting a graceful shutdown and a non-graceful shutdown with a timer.
  // tryShutdown and forceShutdown are idempotent between themselves and each other.
  // Therefore, it is correct if those function execute simultaneously.
  setTimeout(function () {
    server.forceShutdown();
    console.log("Shutting down timed out (5 seconds). Forcing shutdown.");
    process.exit(1);
  }, 5_000);

  server
    .shutdown()
    .then(() => {
      console.log("Done shutting down gracefully.");
      process.exit();
    })
    .catch(error => {
      console.log("Graceful shutdown was unsuccessful: ", error);
      process.exit(1);
    });
});
