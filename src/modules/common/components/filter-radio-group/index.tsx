import { Label, RadioGroup, Text, clx } from "@medusajs/ui"

type FilterRadioGroupProps = {
  title: string
  items: {
    value: string
    label: string
  }[]
  value: any
  handleChange: (...args: any[]) => void
  "data-testid"?: string
}

const FilterRadioGroup = ({
                            title,
                            items,
                            value,
                            handleChange,
                            "data-testid": dataTestId,
                          }: FilterRadioGroupProps) => {
  return (
      <div className="flex flex-col gap-y-4">
        {/* 1. 标题：更细、间距更大、全大写，更有大牌质感 */}
        <Text className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-medium">
          {title}
        </Text>

        <RadioGroup
            data-testid={dataTestId}
            onValueChange={handleChange}
            className="flex flex-col gap-y-2.5"
        >
          {items?.map((i) => {
            const isSelected = i.value === value

            return (
                <div
                    key={i.value}
                    className="flex items-center"
                >
                  <RadioGroup.Item
                      checked={isSelected}
                      className="hidden peer" // 隐藏原生圆圈
                      id={i.value}
                      value={i.value}
                  />
                  <Label
                      htmlFor={i.value}
                      className={clx(
                          // 2. 基础样式：字号缩小到 11px，增加字间距，去掉原生 transform
                          "text-[11px] uppercase tracking-[0.15em] transition-all duration-200 hover:cursor-pointer pb-0.5 border-b",
                          {
                            // 3. 选中态：全黑、正常字重（或中等）、底部黑线
                            "text-black border-black font-medium": isSelected,
                            // 4. 未选中态：灰色、无边框、悬浮变黑
                            "text-gray-400 border-transparent hover:text-black": !isSelected,
                          }
                      )}
                      data-testid="radio-label"
                      data-active={isSelected}
                  >
                    {i.label}
                  </Label>
                </div>
            )
          })}
        </RadioGroup>
      </div>
  )
}

export default FilterRadioGroup