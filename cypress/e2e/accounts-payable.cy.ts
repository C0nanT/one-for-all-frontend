describe("Accounts payable", () => {

  beforeEach(() => {
    cy.login("user@example.com", "password123")
  })

  it("displays all components", () => {
    cy.visit("/accounts-payable")
  })

  it("creates a new payable account", () => {
    cy.visit("/accounts-payable")
  })

  it("edits a payable account", () => {
    cy.visit("/accounts-payable")
  })

  it("deletes a payable account", () => {
    cy.visit("/accounts-payable")
  })

  it("creates a new note", () => {
    cy.visit("/accounts-payable")
  })

  it("edits a note", () => {
    cy.visit("/accounts-payable")
  })

  it("deletes a note", () => {
    cy.visit("/accounts-payable")
  })
})
