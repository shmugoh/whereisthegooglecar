import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const grabRouter = createTRPCRouter({
  grabServices: publicProcedure.query(async ({ ctx }) => {
    const services = await ctx.db.spottings.findMany({
      select: {
        company: true,
      },
    });
    const rawResponse = [
      ...new Set(services.map((service) => service.company)),
    ]; // removes duplicates

    const sortedResponse = rawResponse.map((company) => {
      const label =
        company === "others"
          ? "Others"
          : company.charAt(0).toUpperCase() + company.slice(1);
      return { label: label, value: company };
    });

    return sortedResponse;
  }),

  grabCountries: publicProcedure.query(async ({ ctx }) => {
    const regionNames = new Intl.DisplayNames(["en"], { type: "region" });

    const countries = await ctx.db.spottings.findMany({
      select: {
        country: true,
        countryEmoji: true,
      },
    });
    const countrySet = new Set(
      countries.map((country) => `${country.country}-${country.countryEmoji}`),
    );

    // convert the set to an array of objects and parse to value and label format
    let res: { label: string; value: string }[] = Array.from(countrySet)
      // map the country string to an object with name and emoji properties
      .map((countryString) => {
        const [name, flag] = countryString.split("-");
        return { name: name ?? "", flag: flag ?? "" };
      })
      .map((country) => {
        // grab the country name and return it alongside its ISO code value
        if (country.name === "others") {
          return { label: `${country.flag} - Others`, value: "others" };
        }

        try {
          // define label
          const label = `${country.flag} - ${regionNames.of(country.name) ?? country.name}`;
          return { label: label, value: country.name ?? "" };
        } catch (e) {
          return { label: country.name ?? "", value: country.name ?? "" };
        }
      });

    // sort the countries by value
    res = res.sort((a, b) => {
      if (a.value === "others") return 1;
      if (b.value === "others") return -1;

      // ignore the emoji
      const aLabel = a.label.split(" - ")[1] ?? "";
      const bLabel = b.label.split(" - ")[1] ?? "";

      return aLabel.localeCompare(bLabel);
    });
    return res;
  }),
});
