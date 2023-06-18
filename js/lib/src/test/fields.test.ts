import { getFieldValidator } from "#src/fields.js"

test("email field validates correctly", () => {
  const validator = getFieldValidator({
    type: "email",
  })

  expect(validator("test@example.com")).toEqual([true, "test@example.com"])
  expect(validator("test+suffix@example.com")).toEqual([
    true,
    "test+suffix@example.com",
  ])
  expect(validator("test@example.co.uk")).toEqual([true, "test@example.co.uk"])
  expect(validator("invalid")[0]).toStrictEqual(false)
  expect(validator("test@co.uk")[0]).toStrictEqual(false)
  expect(validator("invalid@example.con")[0]).toStrictEqual(false)
})
