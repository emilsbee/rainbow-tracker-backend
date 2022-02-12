export const checkEnvVars = () => {
  if (
    !process.env.NODE_ENV ||
    !process.env.PORT ||
    !process.env.TEMP_ACCESS_KEY ||
    !process.env.JWT_SECRET ||
    !process.env.DATABASE_URL
  ) {
    console.info("The .env file is not configured correctly.");
    console.info("");

    !process.env.NODE_ENV && console.info("Add NODE_ENV to .env file.");
    !process.env.PORT && console.info("Add PORT to .env file.");
    !process.env.TEMP_ACCESS_KEY && console.info("Add TEMP_ACCESS_KEY to .env file.");
    !process.env.JWT_SECRET && console.info("Add JWT_SECRET to .env file.");
    !process.env.DATABASE_URL && console.info("Add DATABASE_URL to .env file.");

    process.exit();
  }
};
