import http from "http";
import path from "path";
import { readFileSync } from "fs";
import soap from "node-soap";
import { logger } from "../../shared/logger";
import { start } from "repl";

const CITIES = ["Bogotá", "Medellín", "Cali", "Barranquilla", "Cartagena"];

const trackingService = {
  TrackingService: {
    TrackingPort: {
      TrackRoute: (args: { routeId: string }) => {
        const progress = Math.round(Math.random() * 100);
        return {
          routeId: args.routeId,
          lastLocation: CITIES[Math.floor(Math.random() * CITIES.length)],
          ProgressPercentage: progress,
          etaMinutes: Math.round((100 - progress) * 2),
          timestamp: new Date().toISOString(),
        };
      },
    },
  },
};

async function startMockServer(): Promise<void> {
  const wsdlPath = path.join(__dirname, "tracking.wsdl");
  const wsdlXml = readFileSync(wsdlPath, "utf-8");

  const server: http.Server = http.createServer((req, res) => {
    res.writeHead(404);
    res.end();
  });

  soap.listen(server, "/tracking", trackingService, wsdlXml, () => {
    logger.info(
      "Mock SOAP server is running on http://localhost:8000/tracking?wsdl"
    );
  });
  server.listen(8081);
}

startMockServer().catch((error) => {
  logger.error({ error }, "Failed to start mock SOAP server");
  process.exit(1);
});
