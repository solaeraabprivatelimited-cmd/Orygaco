
  # ORYGA

  This is a code bundle for ORYGA. The original project is available at https://www.figma.com/design/Ot9IoDKZlYYU3v1pFUIw73/ORYGA.

  ## Running the code

  Run `npm i` to install the dependencies.

  Run `npm run dev` to start the development server.

  ## SMTP Configuration

  The Supabase server functions can send email when SMTP is configured.

  Create a `.env` file containing:

  ```env
  SMTP_HOST=smtp.example.com
  SMTP_PORT=587
  SMTP_SECURE=false
  SMTP_USER=your-smtp-username
  SMTP_PASS=your-smtp-password
  SMTP_FROM="Orygaco <no-reply@example.com>"
  SUPABASE_URL=https://your-project.supabase.co
  SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
  ```

  Then deploy or run the Supabase functions with those environment variables set.

  ### Testing SMTP Configuration

  After setting environment variables in your Supabase project dashboard:

  ```bash
  # Set your project ID
  export SUPABASE_PROJECT_ID=your-project-id

  # Run the test script
  deno run --allow-env --allow-net test-supabase-smtp.ts
  ```

  This will verify that SMTP is configured and working correctly.
  