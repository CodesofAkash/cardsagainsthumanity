import { CreateInventoryLevelInput, ExecArgs } from "@medusajs/framework/types";
import {
  ContainerRegistrationKeys,
  Modules,
  ProductStatus,
} from "@medusajs/framework/utils";
import {
  createWorkflow,
  transform,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk";
import {
  createApiKeysWorkflow,
  createInventoryLevelsWorkflow,
  createProductsWorkflow,
  createRegionsWorkflow,
  createSalesChannelsWorkflow,
  createShippingOptionsWorkflow,
  createShippingProfilesWorkflow,
  createStockLocationsWorkflow,
  createTaxRegionsWorkflow,
  linkSalesChannelsToApiKeyWorkflow,
  linkSalesChannelsToStockLocationWorkflow,
  updateStoresStep,
  updateStoresWorkflow,
} from "@medusajs/medusa/core-flows";
import { ApiKey } from "../../.medusa/types/query-entry-points";

const updateStoreCurrencies = createWorkflow(
  "update-store-currencies",
  (input: {
    supported_currencies: { currency_code: string; is_default?: boolean }[];
    store_id: string;
  }) => {
    const normalizedInput = transform({ input }, (data) => {
      return {
        selector: { id: data.input.store_id },
        update: {
          supported_currencies: data.input.supported_currencies.map(
            (currency) => {
              return {
                currency_code: currency.currency_code,
                is_default: currency.is_default ?? false,
              };
            }
          ),
        },
      };
    });

    const stores = updateStoresStep(normalizedInput);

    return new WorkflowResponse(stores);
  }
);

export default async function seedDemoData({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const link = container.resolve(ContainerRegistrationKeys.LINK);
  const query = container.resolve(ContainerRegistrationKeys.QUERY);
  const fulfillmentModuleService = container.resolve(Modules.FULFILLMENT);
  const salesChannelModuleService = container.resolve(Modules.SALES_CHANNEL);
  const storeModuleService = container.resolve(Modules.STORE);

  const countries = ["gb", "de", "dk", "se", "fr", "es", "it"];

  logger.info("Seeding store data...");
  const [store] = await storeModuleService.listStores();
  let defaultSalesChannel = await salesChannelModuleService.listSalesChannels({
    name: "Default Sales Channel",
  });

  if (!defaultSalesChannel.length) {
    const { result: salesChannelResult } = await createSalesChannelsWorkflow(
      container
    ).run({
      input: {
        salesChannelsData: [{ name: "Default Sales Channel" }],
      },
    });
    defaultSalesChannel = salesChannelResult;
  }

  await updateStoreCurrencies(container).run({
    input: {
      store_id: store.id,
      supported_currencies: [
        { currency_code: "eur", is_default: true },
        { currency_code: "usd" },
      ],
    },
  });

  await updateStoresWorkflow(container).run({
    input: {
      selector: { id: store.id },
      update: { default_sales_channel_id: defaultSalesChannel[0].id },
    },
  });

  logger.info("Seeding region data...");
  const existingRegions = await query.graph({
    entity: "region",
    fields: ["id"],
  });

  let region: any;
  if (!existingRegions.data.length) {
    const { result: regionResult } = await createRegionsWorkflow(container).run({
      input: {
        regions: [
          {
            name: "Europe",
            currency_code: "eur",
            countries,
            payment_providers: ["pp_system_default"],
          },
        ],
      },
    });
    region = regionResult[0];
    logger.info("Finished seeding regions.");

    logger.info("Seeding tax regions...");
    await createTaxRegionsWorkflow(container).run({
      input: countries.map((country_code) => ({
        country_code,
        provider_id: "tp_system",
      })),
    });
    logger.info("Finished seeding tax regions.");
  } else {
    region = existingRegions.data[0];
    logger.info("Regions already exist, skipping.");
  }

  logger.info("Seeding stock location data...");
  const existingLocations = await query.graph({
    entity: "stock_location",
    fields: ["id"],
  });

  let stockLocation: any;
  if (!existingLocations.data.length) {
    const { result: stockLocationResult } = await createStockLocationsWorkflow(
      container
    ).run({
      input: {
        locations: [
          {
            name: "European Warehouse",
            address: { city: "Copenhagen", country_code: "DK", address_1: "" },
          },
        ],
      },
    });
    stockLocation = stockLocationResult[0];

    await updateStoresWorkflow(container).run({
      input: {
        selector: { id: store.id },
        update: { default_location_id: stockLocation.id },
      },
    });

    await link.create({
      [Modules.STOCK_LOCATION]: { stock_location_id: stockLocation.id },
      [Modules.FULFILLMENT]: { fulfillment_provider_id: "manual_manual" },
    });
  } else {
    stockLocation = existingLocations.data[0];
    logger.info("Stock location already exists, skipping.");
  }

  logger.info("Seeding fulfillment data...");
  const shippingProfiles = await fulfillmentModuleService.listShippingProfiles({
    type: "default",
  });
  let shippingProfile = shippingProfiles.length ? shippingProfiles[0] : null;

  if (!shippingProfile) {
    const { result: shippingProfileResult } =
      await createShippingProfilesWorkflow(container).run({
        input: { data: [{ name: "Default Shipping Profile", type: "default" }] },
      });
    shippingProfile = shippingProfileResult[0];

    const fulfillmentSet = await fulfillmentModuleService.createFulfillmentSets({
      name: "European Warehouse delivery",
      type: "shipping",
      service_zones: [
        {
          name: "Europe",
          geo_zones: countries.map((country_code) => ({
            country_code,
            type: "country" as const,
          })),
        },
      ],
    });

    await link.create({
      [Modules.STOCK_LOCATION]: { stock_location_id: stockLocation.id },
      [Modules.FULFILLMENT]: { fulfillment_set_id: fulfillmentSet.id },
    });

    await createShippingOptionsWorkflow(container).run({
      input: [
        {
          name: "Standard Shipping",
          price_type: "flat",
          provider_id: "manual_manual",
          service_zone_id: fulfillmentSet.service_zones[0].id,
          shipping_profile_id: shippingProfile.id,
          type: { label: "Standard", description: "Ship in 2-3 days.", code: "standard" },
          prices: [
            { currency_code: "usd", amount: 10 },
            { currency_code: "eur", amount: 10 },
            { region_id: region.id, amount: 10 },
          ],
          rules: [
            { attribute: "enabled_in_store", value: "true", operator: "eq" },
            { attribute: "is_return", value: "false", operator: "eq" },
          ],
        },
        {
          name: "Express Shipping",
          price_type: "flat",
          provider_id: "manual_manual",
          service_zone_id: fulfillmentSet.service_zones[0].id,
          shipping_profile_id: shippingProfile.id,
          type: { label: "Express", description: "Ship in 24 hours.", code: "express" },
          prices: [
            { currency_code: "usd", amount: 20 },
            { currency_code: "eur", amount: 20 },
            { region_id: region.id, amount: 20 },
          ],
          rules: [
            { attribute: "enabled_in_store", value: "true", operator: "eq" },
            { attribute: "is_return", value: "false", operator: "eq" },
          ],
        },
      ],
    });
    logger.info("Finished seeding fulfillment data.");

    await linkSalesChannelsToStockLocationWorkflow(container).run({
      input: { id: stockLocation.id, add: [defaultSalesChannel[0].id] },
    });
  } else {
    logger.info("Shipping profile already exists, skipping fulfillment setup.");
  }

  logger.info("Seeding publishable API key data...");
  let publishableApiKey: ApiKey | null = null;
  const { data: apiKeys } = await query.graph({
    entity: "api_key",
    fields: ["id"],
    filters: { type: "publishable" },
  });

  publishableApiKey = apiKeys?.[0];

  if (!publishableApiKey) {
    const { result: [publishableApiKeyResult] } = await createApiKeysWorkflow(container).run({
      input: {
        api_keys: [{ title: "Webshop", type: "publishable", created_by: "" }],
      },
    });
    publishableApiKey = publishableApiKeyResult as ApiKey;
  }

  await linkSalesChannelsToApiKeyWorkflow(container).run({
    input: { id: publishableApiKey.id, add: [defaultSalesChannel[0].id] },
  });
  logger.info("Finished seeding publishable API key data.");

  logger.info("Seeding product data...");

  // Check if products already exist
  const existingProducts = await query.graph({
    entity: "product",
    fields: ["id", "handle"],
  });
  const existingHandles = existingProducts.data.map((p: any) => p.handle);

  const productsToCreate = [
    {
      title: "More Cards Against Humanity",
      handle: "more-cah",
      description: "More Cards Against Humanity comes with 600 expansion cards that instantly double the replayability and girth of your deck.",
      status: ProductStatus.PUBLISHED,
      shipping_profile_id: shippingProfile!.id,
      options: [{ title: "Default", values: ["Default"] }],
      variants: [
        {
          title: "Default",
          sku: "MORE-CAH-DEFAULT",
          options: { Default: "Default" },
          prices: [
            { currency_code: "usd", amount: 2900 },
            { currency_code: "eur", amount: 2900 },
          ],
        },
      ],
      sales_channels: [{ id: defaultSalesChannel[0].id }],
    },
    {
      title: "Tales Vol. 1",
      handle: "tales-vol-1",
      description: "An expansion pack featuring new tales and scenarios.",
      status: ProductStatus.PUBLISHED,
      shipping_profile_id: shippingProfile!.id,
      options: [{ title: "Default", values: ["Default"] }],
      variants: [
        {
          title: "Default",
          sku: "TALES-VOL1-DEFAULT",
          options: { Default: "Default" },
          prices: [
            { currency_code: "usd", amount: 1500 },
            { currency_code: "eur", amount: 1500 },
          ],
        },
      ],
      sales_channels: [{ id: defaultSalesChannel[0].id }],
    },
    {
      title: "Shit List",
      handle: "shit-list",
      description: "A Cards Against Humanity expansion pack.",
      status: ProductStatus.PUBLISHED,
      shipping_profile_id: shippingProfile!.id,
      options: [{ title: "Default", values: ["Default"] }],
      variants: [
        {
          title: "Default",
          sku: "SHIT-LIST-DEFAULT",
          options: { Default: "Default" },
          prices: [
            { currency_code: "usd", amount: 1000 },
            { currency_code: "eur", amount: 1000 },
          ],
        },
      ],
      sales_channels: [{ id: defaultSalesChannel[0].id }],
    },
    {
      title: "Twists Bundle",
      handle: "twists-bundle",
      description: "A bundle of Cards Against Humanity expansion packs.",
      status: ProductStatus.PUBLISHED,
      shipping_profile_id: shippingProfile!.id,
      options: [{ title: "Default", values: ["Default"] }],
      variants: [
        {
          title: "Default",
          sku: "TWISTS-BUNDLE-DEFAULT",
          options: { Default: "Default" },
          prices: [
            { currency_code: "usd", amount: 3500 },
            { currency_code: "eur", amount: 3500 },
          ],
        },
      ],
      sales_channels: [{ id: defaultSalesChannel[0].id }],
    },
  ].filter((p) => !existingHandles.includes(p.handle));

  if (productsToCreate.length) {
    const { result: createdProducts } = await createProductsWorkflow(container).run({
      input: { products: productsToCreate },
    });
    logger.info(`Created ${createdProducts.length} products.`);
    createdProducts.forEach((p: any) => {
    logger.info(`  - ${p.title}: product ID = ${p.id} | variant ID = ${p.variants[0].id}`);    });
  } else {
    logger.info("Products already exist, skipping.");
  }

  logger.info("Seeding inventory levels.");
  
  const { data: inventoryItems } = await query.graph({
    entity: "inventory_item",
    fields: ["id"],
  })

  const { data: existingLevels } = await query.graph({
    entity: "inventory_level", 
    fields: ["inventory_item_id"],
  })

  const existingItemIds = existingLevels.map((l: any) => l.inventory_item_id)

  const inventoryLevels: CreateInventoryLevelInput[] = inventoryItems
    .filter((item: any) => !existingItemIds.includes(item.id))
    .map((item: any) => ({
      location_id: stockLocation.id,
      stocked_quantity: 1000000,
      inventory_item_id: item.id,
    }))

  if (inventoryLevels.length) {
    await createInventoryLevelsWorkflow(container).run({
      input: { inventory_levels: inventoryLevels },
    })
  }

  logger.info("Finished seeding inventory levels data.");
}