// Sample template endpoint
app.get("/api/templates/sample", (req, res) => {
  const sampleTemplate = {
    template_name: "Sample Personalized Template",
    template_body: "Hello {{name}},\n\nThis is a simple template showing how personalization works.\nYou can use {{name}} anywhere in your template to include the user's name.\n\nBest regards,\nYour Team"
  };

  res.json(sampleTemplate);
});
