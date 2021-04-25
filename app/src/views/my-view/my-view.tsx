import * as React from 'react'
import { Button } from 'antd'
import { withStore } from '@/core/store'

interface MyViewProps extends PageProps, StoreProps {
  zakaria: StoreStates['zakaria']
}

declare interface MyViewState {
  resData: Partial<queryTestInfoUsingGET.Response>
  loading: boolean
  createWindowLoading: boolean
  asyncDispatchLoading: boolean
}

@withStore(['zakaria'])
export default class MyView extends React.Component<MyViewProps, MyViewState> {
  state: MyViewState = {
    resData: {},
    loading: false,
    createWindowLoading: false,
    asyncDispatchLoading: false,
  }

  // 构造函数
  constructor(props: MyViewProps) {
    super(props)
  }

  componentDidMount(): void {
    console.log('demo')
    this.props.dispatch({ type: 'ACTION_GET_ZAKARIA', data: 1 })
  }
  render(): JSX.Element {
    return (
      <div className="about flex column center" style={{ height: '100%' }}>
        <Button
          type="primary"
          onClick={() => {
            this.props.dispatch({ type: 'ACTION_ADD_ZAKARIA', data: 1 })
          }}
        >
          Add
        </Button>
      </div>
    )
  }
} // class About end
