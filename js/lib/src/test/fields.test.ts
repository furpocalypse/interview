import { compareDate, getFieldValidator, parseDate } from "#src/fields.js"

test("boolean validates correctly", () => {
  const validator = getFieldValidator({
    type: "bool",
  })

  const validatorOptional = getFieldValidator({
    type: "bool",
    optional: true,
  })

  expect(validator(true)).toStrictEqual([true, true])
  expect(validator(false)).toStrictEqual([true, false])
  expect(validator(undefined)[0]).toStrictEqual(false)
  expect(validatorOptional(undefined)).toStrictEqual([true, undefined])
})

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

test("date parsing works", () => {
  expect(parseDate("2020-01-01")).toEqual(new Date(2020, 0, 1))
  expect(parseDate("2020-12-31")).toEqual(new Date(2020, 11, 31))
  expect(parseDate("")).toBeNull()
  expect(parseDate("invalid")).toBeNull()
  expect(parseDate("20")).toBeNull()
  expect(parseDate("20-12-31")).toBeNull()
  expect(parseDate("aaaa-bb-cc")).toBeNull()
  expect(parseDate("2020-00-10")).toBeNull()
  expect(parseDate("2020-13-10")).toBeNull()
  expect(parseDate("2020-07-00")).toBeNull()
  expect(parseDate("2020-07-32")).toBeNull()
  expect(parseDate("2020-7-31")).toBeNull()
  expect(parseDate("2020-7-1")).toBeNull()
})

test("date comparison works", () => {
  expect(compareDate(new Date(2020, 6, 4), new Date(2020, 6, 4))).toStrictEqual(
    0
  )
  expect(compareDate(new Date(2020, 6, 4), new Date(2020, 6, 5))).toBeLessThan(
    0
  )
  expect(
    compareDate(new Date(2020, 6, 4), new Date(2020, 6, 3))
  ).toBeGreaterThan(0)

  expect(compareDate(new Date(2020, 6, 4), new Date(2020, 7, 4))).toBeLessThan(
    0
  )
  expect(
    compareDate(new Date(2020, 6, 4), new Date(2020, 5, 4))
  ).toBeGreaterThan(0)

  expect(compareDate(new Date(2020, 6, 4), new Date(2022, 6, 4))).toBeLessThan(
    0
  )
  expect(
    compareDate(new Date(2020, 6, 4), new Date(2018, 6, 4))
  ).toBeGreaterThan(0)
})

test("date field validates correctly", () => {
  const validator = getFieldValidator({
    type: "date",
    min: "2020-07-04",
    max: "2020-07-06",
  })

  const validatorOptional = getFieldValidator({
    type: "date",
    min: "2020-07-04",
    max: "2020-07-06",
    optional: true,
  })

  expect(validator(new Date(2020, 6, 4))).toStrictEqual([true, "2020-07-04"])
  expect(validator("2020-07-04")).toStrictEqual([true, "2020-07-04"])
  expect(validator("2020-07-05")).toStrictEqual([true, "2020-07-05"])
  expect(validator("2020-07-03")[0]).toStrictEqual(false)
  expect(validator("2020-07-07")[0]).toStrictEqual(false)
  expect(validator("2021-07-05")[0]).toStrictEqual(false)
  expect(validator(new Date(2020, 6, 3))[0]).toStrictEqual(false)
  expect(validatorOptional(undefined)).toStrictEqual([true, undefined])
})
