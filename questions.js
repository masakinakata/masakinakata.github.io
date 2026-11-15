/* =========================================================
   問題データ
   - answer は配列。2 つ以上なら「複数選択」として出題される
   - why は選択肢ごとの解説（HTML 可）
   - extra は任意の追加 HTML（表やコード例）
   - services は関連するサービス解説ページのキー（services/catalog.js）
   ========================================================= */
const D1 = "Domain 1: 組織の複雑さに対応するソリューションの設計";
const D2 = "Domain 2: 新しいソリューションの設計";
const D3 = "Domain 3: 既存ソリューションの継続的な改善";
const D4 = "Domain 4: ワークロードの移行とモダナイゼーションの加速";

const QUESTIONS = [
  /* ---------- 1 ---------- */
  {
    id: 1,
    services: ["aurora-global-database"],
    domain: D2,
    title: "マルチリージョンの災害対策",
    scenario: `
      <p>ある EC 企業は、us-east-1 リージョンで基幹の注文システムを運用している。構成は
      <strong>Application Load Balancer</strong> + <strong>EC2 Auto Scaling グループ</strong>（ステートレスな Web/AP 層）+
      <strong>Amazon Aurora MySQL</strong>（Multi-AZ）である。</p>
      <p>リージョン全体の障害に備え、別リージョン（us-west-2）への災害対策を構築することになった。経営層からの要件は以下のとおり。</p>
      <ul class="reqs">
        <li>RPO（目標復旧時点）：<strong>1 分以内</strong></li>
        <li>RTO（目標復旧時間）：<strong>15 分以内</strong></li>
        <li>アプリケーションコードの大規模な改修は行わない</li>
        <li>上記を満たしたうえで、<strong>平常時のコストを最小化</strong>する</li>
      </ul>`,
    question: "ソリューションアーキテクトはどの構成を推奨すべきか。",
    options: {
      A: "AWS Backup で Aurora のスナップショットと EC2 の AMI を 1 時間ごとに us-west-2 へコピーする。障害時は CloudFormation テンプレートで us-west-2 に環境一式を作成し、スナップショットから Aurora を復元したうえで Route 53 の DNS レコードを切り替える。",
      B: "Aurora Global Database を構成し、us-west-2 にセカンダリクラスターを作成する。us-west-2 には AMI と起動テンプレートを用意し、ALB と最小キャパシティを小さく設定した Auto Scaling グループを配置しておく。Route 53 のフェイルオーバールーティングとヘルスチェックを設定し、障害時はセカンダリクラスターを昇格させて Auto Scaling グループをスケールアウトする。",
      C: "データベースを Amazon DynamoDB グローバルテーブルに移行し、us-east-1 と us-west-2 の両方で本番と同じキャパシティの ALB と Auto Scaling グループを常時稼働させる。Route 53 のレイテンシーベースルーティングで両リージョンにトラフィックを分散する。",
      D: "us-east-1 の Aurora クラスターに、3 つのアベイラビリティーゾーンへ分散した Aurora レプリカを追加する。Auto Scaling グループも 3 AZ にまたがるよう設定し、ALB のクロスゾーン負荷分散を有効にする。"
    },
    answer: ["B"],
    summary: `正解は <strong>B</strong>。<strong>ウォームスタンバイ（パイロットライトに近い縮小構成）</strong>で、RPO 1 分・RTO 15 分を満たしつつ平常時コストを抑えられるのはこの構成だけです。`,
    why: {
      A: `バックアップ＆リストア方式。スナップショットのコピーが 1 時間ごとなので <strong>RPO は最大 1 時間</strong>となり要件（1 分）を満たさない。さらに障害時に環境構築とスナップショット復元を行うため、データ量によっては <strong>RTO 15 分も厳しい</strong>。コストは最安だが要件未達。`,
      B: `Aurora Global Database はストレージ層で非同期レプリケーションを行い、<strong>リージョン間の遅延は通常 1 秒未満</strong>。障害時はセカンダリを昇格（<code>failover-global-cluster</code> など）でき、数分以内に書き込み可能になるため RPO・RTO ともに満たす。DR 側の EC2 は最小台数にしておき、切り替え時にスケールアウトすることで<strong>平常時コストを抑えられる</strong>。アプリ側は接続先エンドポイントが変わるだけで大規模改修も不要。`,
      C: `マルチサイト（アクティブ/アクティブ）方式。RPO/RTO はほぼゼロにできるが、<strong>両リージョンでフルキャパシティを常時稼働</strong>させるためコスト最小化に反する。また RDB から DynamoDB への移行は<strong>アプリの大規模改修</strong>が必要で、制約にも違反する。`,
      D: `AZ 障害への耐性（高可用性）は上がるが、すべて us-east-1 内に閉じているため<strong>リージョン障害には対応できない</strong>。「HA」と「DR」を混同させるひっかけ。`
    },
    extra: `
      <h3>DR 戦略の比較（頻出）</h3>
      <div class="table-wrap">
        <table>
          <thead><tr><th>戦略</th><th>RPO / RTO の目安</th><th>平常時コスト</th><th>本問の選択肢</th></tr></thead>
          <tbody>
            <tr><td>バックアップ＆リストア</td><td>時間単位</td><td>最小</td><td>A</td></tr>
            <tr><td>パイロットライト</td><td>分〜数十分</td><td>小（DB のみ常時稼働）</td><td>—</td></tr>
            <tr class="hit"><td>ウォームスタンバイ</td><td>秒〜分</td><td>中（縮小版を常時稼働）</td><td>B</td></tr>
            <tr><td>マルチサイト（アクティブ/アクティブ）</td><td>ほぼゼロ</td><td>最大</td><td>C</td></tr>
          </tbody>
        </table>
      </div>`,
    points: [
      `「RPO が秒〜1 分」「リレーショナル DB」「別リージョン」の組み合わせが出たら <strong>Aurora Global Database</strong> をまず疑う。`,
      `SAP では「要件を満たす選択肢」が複数あり、<strong>「コスト最小」「運用負荷最小」などの最後の条件</strong>で絞り込ませる問題が多い。`,
      `Multi-AZ やリードレプリカの追加は<strong>高可用性（HA）</strong>であって、<strong>リージョン障害の DR ではない</strong>。`,
      `DNS の切り替えは Route 53 のフェイルオーバールーティング + ヘルスチェックが定番。より高速・確実な切り替えが必要なら Route 53 Application Recovery Controller も選択肢になる。`
    ]
  },

  /* ---------- 2 ---------- */
  {
    id: 2,
    services: ["transit-gateway"],
    domain: D1,
    title: "多数の VPC とオンプレミスの接続",
    scenario: `
      <p>ある製造業の企業は AWS Organizations で 40 個の AWS アカウントを管理しており、各アカウントに 1〜2 個の VPC（合計約 60 個）がある。
      オンプレミスのデータセンターとは <strong>10 Gbps の AWS Direct Connect</strong> 専用接続で結ばれている。</p>
      <p>新たに以下の要件が出された。</p>
      <ul class="reqs">
        <li>すべての VPC 間、および各 VPC とオンプレミス間で<strong>相互に通信</strong>できること</li>
        <li>今後 2 年で VPC は <strong>200 個程度まで増える</strong>見込み</li>
        <li>ネットワークチームが 1 つのアカウントから<strong>ルーティングを集中管理</strong>したい</li>
        <li><strong>運用負荷を最小化</strong>する</li>
      </ul>`,
    question: "これらの要件を満たす最適な設計はどれか。",
    options: {
      A: "すべての VPC 間をフルメッシュの VPC ピアリングで接続する。各 VPC に仮想プライベートゲートウェイ（VGW）をアタッチし、VPC ごとに Direct Connect のプライベート VIF を作成してオンプレミスと接続する。",
      B: "ネットワーク専用アカウントに AWS Transit Gateway を作成し、AWS RAM で組織内に共有して各 VPC をアタッチする。Direct Connect ゲートウェイを作成してトランジット VIF で接続し、Transit Gateway に関連付ける。",
      C: "ハブ VPC にサードパーティ製の VPN アプライアンスを EC2 で冗長構成し、各 VPC の VGW からハブ VPC へ Site-to-Site VPN を張る「トランジット VPC」構成にする。オンプレミスもハブ VPC に VPN で接続する。",
      D: "各 VPC のサービスを Network Load Balancer の背後に配置し、AWS PrivateLink のエンドポイントサービスとして公開する。他の VPC やオンプレミスからはインターフェイス VPC エンドポイント経由でアクセスする。"
    },
    answer: ["B"],
    summary: `正解は <strong>B</strong>。多数の VPC とオンプレミスを<strong>ハブ＆スポーク</strong>で推移的に接続でき、1 アカウントから集中管理できるのは Transit Gateway + Direct Connect ゲートウェイの組み合わせです。`,
    why: {
      A: `VPC ピアリングは<strong>推移的ルーティング不可</strong>のため、全 VPC 間を結ぶにはフルメッシュ（200 VPC なら約 2 万本）が必要。1 VPC あたりのピアリング数にも上限があり、VPC ごとの VIF 作成も含め<strong>運用負荷・スケーラビリティともに破綻</strong>する。`,
      B: `Transit Gateway はリージョン内のハブとして<strong>数千の VPC アタッチメント</strong>を扱え、ルートテーブルでセグメント分割も可能。AWS RAM で共有すれば各アカウントの VPC からアタッチでき、ルーティングはネットワークアカウントで<strong>集中管理</strong>できる。Direct Connect ゲートウェイ + <strong>トランジット VIF</strong> でオンプレミスとも 1 か所で接続できる。`,
      C: `かつての定番構成だが、EC2 アプライアンスの冗長化・パッチ・ライセンス管理が必要で<strong>運用負荷が高い</strong>。VPN トンネルあたりの帯域（約 1.25 Gbps）の制約もあり、Transit Gateway 登場後は推奨されない。`,
      D: `PrivateLink は<strong>特定サービスを一方向に公開</strong>する仕組みで、ネットワーク全体の相互ルーティングを提供するものではない。「すべての VPC 間で相互通信」という要件を満たせない。`
    },
    points: [
      `「多数の VPC」「推移的接続」「集中管理」→ <strong>Transit Gateway + AWS RAM 共有</strong>が定番。`,
      `Direct Connect と Transit Gateway をつなぐのは<strong>トランジット VIF</strong>（プライベート VIF ではない）。Direct Connect ゲートウェイ経由で関連付ける。`,
      `複数リージョンにまたがる場合は Transit Gateway ピアリング、さらに大規模・ポリシー駆動のグローバル WAN なら AWS Cloud WAN も候補。`,
      `PrivateLink は「サービス単位」「一方向」「CIDR 重複でも可」がキーワード。`
    ]
  },

  /* ---------- 3 ---------- */
  {
    id: 3,
    services: ["scp"],
    domain: D1,
    title: "リージョン利用の制限とガバナンス",
    scenario: `
      <p>ある金融機関は AWS Organizations で多数のメンバーアカウントを運用している。データ所在地の規制に対応するため、セキュリティ部門から以下の要件が示された。</p>
      <ul class="reqs">
        <li>すべてのメンバーアカウントで、<strong>ap-northeast-1 と ap-northeast-3 以外のリージョン</strong>ではリソースを作成・操作できないようにする</li>
        <li>IAM、Route 53、CloudFront などの<strong>グローバルサービス</strong>は引き続き利用できること</li>
        <li>メンバーアカウントの管理者（AdministratorAccess を持つユーザーや root ユーザーを含む）でも<strong>この制限を解除・回避できない</strong>こと</li>
        <li>メンバーアカウントが<strong>組織から脱退できない</strong>ようにする</li>
      </ul>`,
    question: "これらの要件を満たす最も効果的な方法はどれか。",
    options: {
      A: "各メンバーアカウントで、全 IAM ユーザーとロールに「aws:RequestedRegion が許可リスト外なら Deny」とする IAM ポリシーをアタッチする。CloudFormation StackSets で全アカウントに展開する。",
      B: "組織のルートに SCP をアタッチする。グローバルサービスを NotAction で除外したうえで、aws:RequestedRegion が許可リスト外の場合に Deny するステートメントと、organizations:LeaveOrganization を Deny するステートメントを含める。",
      C: "AWS Config の組織ルールで許可リスト外のリージョンに作成されたリソースを検出し、AWS Systems Manager Automation で自動削除する。組織からの脱退は CloudTrail で監視してアラートを上げる。",
      D: "すべての IAM ユーザーとロールに、許可リージョンのみを許可するアクセス許可の境界（Permissions Boundary）を設定する。新規プリンシパルの作成時にも境界の設定を必須とする。"
    },
    answer: ["B"],
    summary: `正解は <strong>B</strong>。メンバーアカウントの管理者や root ユーザーでも回避できない<strong>予防的ガードレール</strong>は SCP（サービスコントロールポリシー）です。`,
    why: {
      A: `IAM ポリシーはそのアカウントの管理者が<strong>自由に外せる</strong>ため「回避できない」要件を満たさない。また <strong>root ユーザーには IAM ポリシーが適用されない</strong>。`,
      B: `SCP はメンバーアカウントの<strong>root ユーザーを含む全プリンシパル</strong>の権限の上限を定め、メンバーアカウント側からは変更できない。<code>NotAction</code> でグローバルサービスを除外し、<code>aws:RequestedRegion</code> 条件で Deny するのが定石。<code>organizations:LeaveOrganization</code> の Deny で脱退も防げる。`,
      C: `Config ルールは<strong>発見的（detective）</strong>統制であり、リソースは一度作成されてしまう。脱退の監視もアラートのみで<strong>防止にはならない</strong>。`,
      D: `アクセス許可の境界はアカウント内の管理者が<strong>変更・削除できる</strong>うえ、<strong>root ユーザーには適用されない</strong>。全プリンシパルへの設定漏れのリスクもある。`
    },
    extra: `
      <h3>SCP の例</h3>
<pre><code>{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "DenyOutsideApprovedRegions",
      "Effect": "Deny",
      "NotAction": [
        "iam:*", "organizations:*", "route53:*", "cloudfront:*",
        "sts:*", "support:*", "waf:*", "budgets:*"
      ],
      "Resource": "*",
      "Condition": {
        "StringNotEquals": {
          "aws:RequestedRegion": ["ap-northeast-1", "ap-northeast-3"]
        }
      }
    },
    {
      "Sid": "DenyLeaveOrganization",
      "Effect": "Deny",
      "Action": "organizations:LeaveOrganization",
      "Resource": "*"
    }
  ]
}</code></pre>`,
    points: [
      `SCP は<strong>権限を付与しない</strong>。あくまで上限（ガードレール）であり、実際の許可は IAM ポリシーで与える。`,
      `SCP は<strong>管理アカウントには適用されない</strong>。管理アカウントでワークロードを動かさないのがベストプラクティス。`,
      `「予防的」→ SCP / RCP、「発見的」→ AWS Config / Security Hub、という区別を押さえる。AWS Control Tower にはこれらをまとめたコントロール（リージョン拒否など）もある。`,
      `グローバルサービスは us-east-1 などで API が処理されるため、<code>NotAction</code> で除外しないと利用できなくなる点がひっかけになりやすい。`
    ]
  },

  /* ---------- 4 ---------- */
  {
    id: 4,
    services: ["ec2-spot"],
    domain: D3,
    title: "夜間バッチのコスト最適化",
    scenario: `
      <p>ある保険会社は、毎晩 0 時から約 4 時間、リスク計算のバッチ処理を EC2 オンデマンドインスタンス（ピーク時 合計約 400 vCPU）で実行している。日中はインスタンスを使用していない。</p>
      <ul class="reqs">
        <li>ジョブは数千の小さなタスクに分割されており、各タスクは<strong>チェックポイントから再実行可能</strong></li>
        <li>結果は<strong>翌朝 8 時までに</strong>出ていればよい（時間には余裕がある）</li>
        <li>特定のインスタンスタイプへの依存はなく、汎用・コンピューティング最適化のどちらでも動作する</li>
        <li><strong>コストを最小化</strong>したい</li>
      </ul>`,
    question: "最もコスト効率の高い方法はどれか。",
    options: {
      A: "ピーク時の 400 vCPU 分について、3 年間・全額前払いの Standard リザーブドインスタンスを購入する。",
      B: "ピーク時の 1 時間あたり使用額に合わせて、1 年間の Compute Savings Plans を購入する。",
      C: "EC2 Auto Scaling グループ（または AWS Batch）でスポットインスタンスを使用し、複数のインスタンスタイプ・ファミリーと複数の AZ を指定して、配分戦略に price-capacity-optimized を設定する。中断通知を受けたタスクはチェックポイントから再実行する。",
      D: "毎晩 0 時から 4 時間分、400 vCPU 相当のオンデマンドキャパシティ予約（ODCR）を作成し、確実にキャパシティを確保する。"
    },
    answer: ["C"],
    summary: `正解は <strong>C</strong>。<strong>中断耐性があり、時間に余裕があり、インスタンスタイプに柔軟</strong>なワークロードはスポットインスタンスの理想的な用途で、オンデマンド比で最大 90% 程度の削減が見込めます。`,
    why: {
      A: `RI は<strong>24 時間 365 日分の料金</strong>を支払う契約。1 日 4 時間（稼働率約 17%）の利用では、割引を考慮しても<strong>オンデマンドより割高</strong>になる。`,
      B: `Savings Plans も<strong>1 時間あたりの利用額を 24 時間コミット</strong>する仕組みなので、A と同様に未使用時間分が無駄になる。常時稼働のベースライン向け。`,
      C: `スポットは中断の可能性があるが、本ワークロードは<strong>チェックポイントで再実行可能</strong>かつ<strong>締め切りに余裕</strong>があるため影響は小さい。複数のタイプ・AZ に分散し <code>price-capacity-optimized</code> を使うことで、中断の可能性が低いプールから安価に調達できる。`,
      D: `ODCR は<strong>キャパシティを確保するだけで割引はない</strong>（オンデマンド料金）。予約中は使わなくても課金されるため、コスト削減にはならない。`
    },
    extra: `
      <h3>購入オプションの使い分け</h3>
      <div class="table-wrap">
        <table>
          <thead><tr><th>オプション</th><th>向いているワークロード</th><th>本問の選択肢</th></tr></thead>
          <tbody>
            <tr><td>リザーブドインスタンス</td><td>常時稼働・構成が固定</td><td>A</td></tr>
            <tr><td>Savings Plans</td><td>常時稼働のベースライン（タイプ変更の柔軟性あり）</td><td>B</td></tr>
            <tr class="hit"><td>スポットインスタンス</td><td>中断耐性あり・時間に柔軟・ステートレス</td><td>C</td></tr>
            <tr><td>オンデマンドキャパシティ予約</td><td>割引なしでキャパシティを確実に確保したい</td><td>D</td></tr>
          </tbody>
        </table>
      </div>`,
    points: [
      `スポットのキーワードは「<strong>中断されても再実行可能</strong>」「<strong>期限に余裕</strong>」「<strong>インスタンスタイプに柔軟</strong>」。`,
      `スポットの中断通知は <strong>2 分前</strong>。EventBridge やインスタンスメタデータで検知してチェックポイントを保存する。`,
      `配分戦略は現在 <code>price-capacity-optimized</code> が推奨。<code>lowest-price</code> は中断率が上がりやすい。`,
      `RI / Savings Plans は「常時稼働部分」、スポットは「変動・中断可能部分」と組み合わせるのが SAP の頻出パターン。`
    ]
  },

  /* ---------- 5 ---------- */
  {
    id: 5,
    services: ["dms"],
    domain: D4,
    title: "Oracle から Aurora PostgreSQL への移行",
    scenario: `
      <p>ある小売企業は、オンプレミスで 5 TB の <strong>Oracle Database</strong>（OLTP、ストアドプロシージャを多数使用）を運用している。
      ライセンスコスト削減のため、<strong>Amazon Aurora PostgreSQL</strong> へ移行することが決まった。オンプレミスと AWS は 1 Gbps の Direct Connect で接続されている。</p>
      <ul class="reqs">
        <li>移行時のアプリケーション<strong>停止時間は 1 時間以内</strong></li>
        <li>移行先のエンジンは <strong>Aurora PostgreSQL</strong> とする（Oracle ライセンスを使わない）</li>
        <li>ストアドプロシージャを含むスキーマも移行対象とする</li>
      </ul>`,
    question: "要件を満たす移行方法はどれか。",
    options: {
      A: "Oracle Data Pump でフルエクスポートを取得して Amazon S3 にアップロードし、Aurora PostgreSQL の S3 インポート機能でダンプファイルを取り込む。",
      B: "AWS SCT（または AWS DMS Schema Conversion）でスキーマとストアドプロシージャを変換し、自動変換できない箇所は手動で修正する。その後 AWS DMS で全ロードと継続的なレプリケーション（CDC）を行い、差分がほぼなくなった時点でアプリケーションの接続先を切り替える。",
      C: "AWS DMS で Amazon RDS for Oracle（ライセンス込み）へ全ロード + CDC で移行し、切り替え後に RDS for Oracle 上でアプリケーションを稼働させる。",
      D: "メンテナンスウィンドウ中にアプリケーションを停止し、AWS DMS の全ロードのみ（CDC なし）のタスクで Aurora PostgreSQL へデータを移行してから接続先を切り替える。"
    },
    answer: ["B"],
    summary: `正解は <strong>B</strong>。<strong>異種エンジン間の移行</strong>は「スキーマ変換（SCT / DMS Schema Conversion）」＋「データ移行（DMS 全ロード + CDC）」の 2 段階が定石で、CDC によって停止時間を最小化できます。`,
    why: {
      A: `Data Pump のダンプは <strong>Oracle 固有の形式</strong>であり、PostgreSQL では取り込めない。スキーマ変換もされず、仮にできても停止時間が長くなる。`,
      B: `異種移行ではまず<strong>スキーマ・コードの変換</strong>が必要。DMS の<strong>全ロード + CDC</strong> によりソースを稼働させたまま同期を続け、切り替え時はアプリ停止 → 差分適用完了 → 接続先変更のみで済むため<strong>1 時間以内の停止</strong>が実現できる。`,
      C: `データ移行手法としては停止時間の要件を満たせるが、移行先が Oracle のままで<strong>ライセンスコスト削減</strong>・「Aurora PostgreSQL へ移行」という要件を満たさない。`,
      D: `5 TB を 1 Gbps で転送するだけでも理論値で約 11 時間かかり、<strong>停止時間 1 時間以内</strong>を満たせない。また DMS はスキーマ（ストアドプロシージャ等）を変換しない。`
    },
    points: [
      `<strong>同種移行</strong>（Oracle→Oracle など）はネイティブツールや DMS、<strong>異種移行</strong>は SCT / DMS Schema Conversion + DMS。`,
      `「停止時間を最小化」→ DMS の <strong>CDC（変更データキャプチャ）</strong>。Oracle ソースではサプリメンタルロギングの有効化が必要。`,
      `DMS は<strong>テーブルとデータ</strong>を移行するが、ストアドプロシージャやトリガーなどのコードオブジェクトは変換しない。`,
      `大容量データの転送時間は「容量 × 8 ÷ 帯域」でざっくり計算できるようにしておく（5 TB / 1 Gbps ≒ 11 時間）。`
    ]
  },

  /* ---------- 6 ---------- */
  {
    id: 6,
    services: ["mgn"],
    domain: D4,
    title: "大量サーバーのリホスト移行",
    scenario: `
      <p>ある企業は、オンプレミスの VMware 環境で稼働する約 300 台の仮想マシン（Windows Server と Red Hat Enterprise Linux が混在）を AWS へ移行する。
      データセンターの契約は 6 か月後に終了する。</p>
      <ul class="reqs">
        <li>アプリケーションの<strong>コード変更や再構築は行わない</strong>（リホスト）</li>
        <li>本番切り替え前に AWS 上で<strong>テスト起動</strong>して動作確認したい</li>
        <li>各アプリケーションの切り替え時の<strong>停止時間は数分〜数十分</strong>に抑えたい</li>
        <li>移行作業はできるだけ<strong>自動化</strong>したい</li>
      </ul>`,
    question: "最も適切な移行方法はどれか。",
    options: {
      A: "各仮想マシンを停止して OVA 形式でエクスポートし、Amazon S3 にアップロードして VM Import/Export で AMI に変換する。AMI から EC2 インスタンスを起動して切り替える。",
      B: "AWS Application Migration Service（AWS MGN）を使用し、各ソースサーバーにレプリケーションエージェントをインストールしてブロックレベルの継続的レプリケーションを行う。テストインスタンスで動作確認した後、カットオーバーを実施する。",
      C: "各アプリケーションを AWS Elastic Beanstalk 環境として再構築し、データベースは Amazon RDS に移行する。",
      D: "AWS DataSync で各仮想マシンのファイルシステムを Amazon EFS に転送し、新たに作成した EC2 インスタンスから EFS をマウントしてアプリケーションを起動する。"
    },
    answer: ["B"],
    summary: `正解は <strong>B</strong>。大規模な<strong>リホスト（リフト＆シフト）</strong>で、継続的レプリケーション・テスト起動・短時間カットオーバーを実現する AWS 推奨サービスは <strong>AWS Application Migration Service（MGN）</strong>です。`,
    why: {
      A: `エクスポート・アップロード・変換の間ずっと VM を<strong>停止</strong>する必要があり（または停止しなければデータがずれる）、停止時間が長くなる。300 台を手作業で行うのは<strong>自動化</strong>要件にも合わない。`,
      B: `MGN はソースサーバーのディスクを<strong>ブロックレベルで継続的にレプリケーション</strong>するため、カットオーバー時は最終同期と起動だけで済み<strong>停止時間は分単位</strong>。<strong>テスト起動</strong>やローンチテンプレート、ウェーブ単位の一括操作など自動化機能も備える。OS やアプリへの変更は不要。`,
      C: `<strong>リプラットフォーム</strong>に該当し、アプリの再構築が必要。「コード変更や再構築は行わない」という要件に反するうえ、6 か月で 300 台は現実的でない。`,
      D: `DataSync は<strong>ファイル/オブジェクトの転送</strong>サービスであり、OS やアプリを含むサーバーそのものは移行できない。`
    },
    extra: `
      <h3>移行戦略「7 つの R」</h3>
      <div class="table-wrap">
        <table>
          <thead><tr><th>戦略</th><th>概要</th><th>代表的なサービス</th></tr></thead>
          <tbody>
            <tr class="hit"><td>Rehost（リホスト）</td><td>そのまま移す</td><td>AWS MGN</td></tr>
            <tr><td>Replatform（リプラットフォーム）</td><td>一部をマネージドに置き換え</td><td>RDS、Elastic Beanstalk</td></tr>
            <tr><td>Repurchase（再購入）</td><td>SaaS に乗り換え</td><td>—</td></tr>
            <tr><td>Refactor（リファクタリング）</td><td>クラウドネイティブに再設計</td><td>Lambda、ECS、DynamoDB</td></tr>
            <tr><td>Relocate（リロケート）</td><td>ハイパーバイザーごと移す</td><td>VMware Cloud on AWS 等</td></tr>
            <tr><td>Retain / Retire</td><td>保持 / 廃止</td><td>—</td></tr>
          </tbody>
        </table>
      </div>`,
    points: [
      `「リホスト」「大量サーバー」「最小ダウンタイム」→ <strong>AWS MGN</strong>。`,
      `MGN はレプリケーションサーバー用の<strong>ステージングエリアのサブネット</strong>を用意し、低コストな EBS にデータを保持する。`,
      `VM Import/Export は少数台の単発移行やイメージ取り込み向け。`,
      `DMS は DB、DataSync はファイル、MGN はサーバー、と「何を移すか」でサービスを切り分ける。`
    ]
  },

  /* ---------- 7 ---------- */
  {
    id: 7,
    services: ["kms"],
    domain: D2,
    title: "SSE-KMS 暗号化バケットへのクロスアカウントアクセス",
    scenario: `
      <p>アカウント A の S3 バケットには、アカウント A の <strong>カスタマーマネージドキー（KMS）による SSE-KMS</strong> で暗号化されたオブジェクトが保存されている。
      アカウント B の Lambda 関数からこれらのオブジェクトを読み取る必要がある。</p>
      <p>バケットポリシーではすでにアカウント B の Lambda 実行ロールに <code>s3:GetObject</code> を許可しており、実行ロールの IAM ポリシーにも <code>s3:GetObject</code> が付与されている。
      しかし Lambda からの <code>GetObject</code> は <strong>AccessDenied</strong> で失敗する。</p>
      <p>セキュリティポリシーにより、<strong>カスタマーマネージドキーによる暗号化は継続</strong>しなければならない。</p>`,
    question: "この問題を解決するために必要な手順はどれか。（2 つ選択）",
    options: {
      A: "アカウント A の KMS キーのキーポリシーに、アカウント B（または Lambda 実行ロール）に対して kms:Decrypt を許可するステートメントを追加する。",
      B: "アカウント B の Lambda 実行ロールの IAM ポリシーに、アカウント A の KMS キーの ARN を対象として kms:Decrypt を許可するステートメントを追加する。",
      C: "バケットのデフォルト暗号化を AWS マネージドキー（aws/s3）に変更し、既存オブジェクトを再暗号化する。",
      D: "バケットの ACL で、アカウント B の正規ユーザー ID に READ 権限を付与する。",
      E: "Lambda 実行ロールの信頼ポリシーにアカウント A のルートプリンシパルを追加する。"
    },
    answer: ["A", "B"],
    summary: `正解は <strong>A と B</strong>。クロスアカウントで KMS キーを使うには、<strong>キー側（キーポリシー）とプリンシパル側（IAM ポリシー）の両方</strong>で許可が必要です。`,
    why: {
      A: `KMS のアクセス制御はキーポリシーが起点。他アカウントのプリンシパルが使うには、まず<strong>キーポリシーで当該アカウント（またはロール）を許可</strong>する必要がある。`,
      B: `キーポリシーで外部アカウントを許可しても、それは「アカウント B に委任できる」という意味にとどまる。アカウント B 側でも <strong>IAM ポリシーで kms:Decrypt を付与</strong>しないとロールは使えない。`,
      C: `AWS マネージドキーは<strong>キーポリシーを編集できない</strong>ため、そもそもクロスアカウントでの復号を許可できない。さらに「カスタマーマネージドキーを継続」という要件にも反する。`,
      D: `S3 側の読み取り権限はバケットポリシーで既に付与済み。失敗原因は <strong>KMS の復号権限</strong>であり、ACL を追加しても解決しない（現在は ACL 無効化が推奨）。`,
      E: `信頼ポリシーは「誰がそのロールを引き受けられるか」を定義するもので、KMS キーの利用可否には関係しない。`
    },
    points: [
      `クロスアカウントアクセスは「<strong>リソース側のポリシー</strong>」と「<strong>呼び出し側の IAM ポリシー</strong>」の両方で許可が必要、が大原則。`,
      `SSE-KMS のオブジェクト読み取りには <code>s3:GetObject</code> に加えて <code>kms:Decrypt</code> が必要（書き込みは <code>kms:GenerateDataKey</code>）。`,
      `AWS マネージドキー（<code>aws/s3</code> など）はキーポリシーを変更できないため、<strong>クロスアカウント共有には使えない</strong>。`,
      `KMS 呼び出しを減らしてコストを下げたい場合は <strong>S3 バケットキー</strong>を有効化する。`
    ]
  },

  /* ---------- 8 ---------- */
  {
    id: 8,
    services: ["sqs"],
    domain: D3,
    title: "処理層の疎結合化とスケーリング",
    scenario: `
      <p>ある写真共有サービスでは、Web 層（EC2）がユーザーの画像を S3 に保存した後、処理層（EC2 フリート）の API を<strong>同期的に HTTP で呼び出し</strong>てサムネイル生成やフィルター処理を行っている。
      1 件の処理には 30 秒〜2 分かかる。</p>
      <p>キャンペーン時など<strong>予測できないアクセス急増</strong>が発生すると、処理層がタイムアウトして一部のリクエストが失われている。</p>
      <ul class="reqs">
        <li>アクセス急増時でも<strong>処理依頼を失わない</strong>こと</li>
        <li>処理層は<strong>未処理の量に応じて</strong>自動でスケールすること</li>
        <li>繰り返し失敗する依頼は<strong>隔離して後で調査</strong>できること</li>
      </ul>`,
    question: "これらの要件を満たす最適なアーキテクチャ変更はどれか。",
    options: {
      A: "処理層のインスタンスタイプをより大きなものに変更し、処理層の前段に Application Load Balancer を追加して負荷を分散する。",
      B: "Web 層は処理依頼を Amazon SQS 標準キューに送信し、処理層はキューをポーリングして処理する。処理層の Auto Scaling は「インスタンスあたりのバックログ（ApproximateNumberOfMessagesVisible ÷ 稼働インスタンス数）」をターゲット追跡し、可視性タイムアウトを最大処理時間より長く設定する。maxReceiveCount を設定したデッドレターキューを構成する。",
      C: "Web 層は処理依頼を Amazon SNS トピックに発行し、処理層の各インスタンスを HTTP エンドポイントとしてサブスクライブさせる。",
      D: "過去のキャンペーン実績に基づき、処理層の Auto Scaling にスケジュールされたスケーリングを設定してキャンペーン時間帯に台数を増やす。"
    },
    answer: ["B"],
    summary: `正解は <strong>B</strong>。<strong>SQS をバッファ</strong>として挟むことで依頼を失わず、<strong>バックログ量に基づくスケーリング</strong>と<strong>DLQ</strong> で残りの要件も満たせます。`,
    why: {
      A: `同期呼び出しのままでは、処理能力を超えたリクエストはやはり<strong>タイムアウトして失われる</strong>。スケールアップには上限があり、根本解決にならない。`,
      B: `SQS は依頼を<strong>耐久性のあるキューに保持</strong>するため、処理層が追いつかなくても失われない。バックログ/インスタンスのターゲット追跡で<strong>未処理量に比例したスケール</strong>が可能。可視性タイムアウトを処理時間より長くすることで二重処理を防ぎ、<strong>DLQ</strong> で失敗メッセージを隔離できる。`,
      C: `SNS は<strong>プッシュ型</strong>で、エンドポイントが過負荷でも配信を試み続け、リトライ上限を超えると配信に失敗する。バッファとしての役割は果たせず、未処理量に応じたスケーリングもしにくい。`,
      D: `アクセス急増は<strong>予測できない</strong>ため、スケジュールでは対応しきれない。同期呼び出しの問題も残る。`
    },
    points: [
      `「依頼を失わない」「スパイクを吸収」→ <strong>SQS で疎結合化</strong>。`,
      `SQS 連動のスケーリングは<strong>「インスタンスあたりのバックログ」</strong>をカスタムメトリクスとしてターゲット追跡するのが AWS 推奨。`,
      `<strong>可視性タイムアウト</strong> &lt; 処理時間だと、処理中のメッセージが再度見えてしまい二重処理になる。`,
      `順序保証や重複排除が必要なら FIFO キュー。ただしスループットに上限がある点に注意。`
    ]
  },

  /* ---------- 9 ---------- */
  {
    id: 9,
    services: ["cloudtrail"],
    domain: D1,
    title: "組織全体の監査ログの一元管理",
    scenario: `
      <p>ある企業は AWS Organizations で約 80 個のアカウントを運用しており、毎月新しいアカウントが追加される。監査部門から以下の要件が示された。</p>
      <ul class="reqs">
        <li><strong>新規アカウントも含め</strong>、すべてのアカウントの API アクティビティを記録する</li>
        <li>ログは専用の <strong>Log Archive アカウント</strong>に一元的に保存する</li>
        <li>メンバーアカウントの管理者がログ記録を<strong>停止・削除できない</strong>こと</li>
        <li>ログは <strong>7 年間、誰も改ざん・削除できない</strong>状態で保持する</li>
        <li><strong>運用負荷を最小化</strong>する</li>
      </ul>`,
    question: "これらの要件を満たす最適な方法はどれか。",
    options: {
      A: "CloudFormation StackSets の自動デプロイを使い、各アカウントに CloudTrail の証跡を作成して Log Archive アカウントの S3 バケットへ出力する。SCP で cloudtrail:StopLogging と cloudtrail:DeleteTrail を拒否する。",
      B: "管理アカウント（または委任管理者アカウント）で組織の証跡（Organization Trail）を作成し、Log Archive アカウントの S3 バケットに出力する。バケットは S3 オブジェクトロックをコンプライアンスモード・保持期間 7 年で有効化し、ログファイルの整合性検証を有効にする。",
      C: "各アカウントの CloudTrail イベント履歴を Amazon Athena で定期的にクエリし、結果を Log Archive アカウントの S3 バケットに保存する。",
      D: "管理アカウントで組織の証跡を作成し、管理アカウント内の S3 バケットに出力する。バケットではバージョニングと MFA Delete を有効にする。"
    },
    answer: ["B"],
    summary: `正解は <strong>B</strong>。<strong>組織の証跡</strong>は新規アカウントにも自動適用され、メンバーアカウントからは変更・削除できません。<strong>オブジェクトロックのコンプライアンスモード</strong>で root ユーザーを含め誰も削除できない保持を実現できます。`,
    why: {
      A: `記録の網羅自体は可能だが、アカウントごとの証跡を管理するため<strong>運用負荷が組織の証跡より高い</strong>。また<strong>ログの不変性（7 年間削除不可）</strong>についての対策がない。`,
      B: `組織の証跡は<strong>全メンバーアカウント（新規含む）に自動適用</strong>され、メンバー側では停止・削除できない。Log Archive アカウントへの集約、<strong>コンプライアンスモード</strong>による削除・上書き防止、整合性検証による改ざん検知まで、すべての要件を最小の運用で満たす。`,
      C: `CloudTrail イベント履歴は<strong>過去 90 日分の管理イベント</strong>のみで、データイベントは含まれない。定期処理の運用も必要で、改ざん防止の仕組みもない。`,
      D: `バージョニングや MFA Delete は削除を難しくするが、root ユーザーなら MFA を使って削除できるため<strong>「誰も削除できない」保証にはならない</strong>。また「Log Archive アカウントに保存」という要件を満たさない。`
    },
    points: [
      `「全アカウント」「新規アカウントにも自動適用」「メンバーが変更不可」→ <strong>組織の証跡</strong>。`,
      `オブジェクトロックの<strong>コンプライアンスモード</strong>は root でも削除・短縮不可。<strong>ガバナンスモード</strong>は特別な権限があれば解除できる。`,
      `ログ専用アカウント（Log Archive）とセキュリティツール用アカウント（Audit）を分けるのはマルチアカウント戦略の定石（AWS Control Tower のデフォルト構成も同様）。`,
      `CloudTrail の<strong>ログファイルの整合性検証</strong>で、ダイジェストファイルによる改ざん検知ができる。`
    ]
  },

  /* ---------- 10 ---------- */
  {
    id: 10,
    services: ["route53-resolver"],
    domain: D2,
    title: "ハイブリッド環境の DNS 名前解決",
    scenario: `
      <p>ある企業は複数アカウントにまたがる 25 個の VPC を Transit Gateway で接続し、オンプレミスとは Direct Connect で接続している。
      VPC 内のリソースは Route 53 プライベートホストゾーン <code>aws.example.internal</code> で名前解決している。オンプレミスには社内ドメイン <code>corp.example.com</code> を管理する DNS サーバーがある。</p>
      <ul class="reqs">
        <li>オンプレミスのサーバーから <code>aws.example.internal</code> を名前解決できること</li>
        <li>すべての VPC のリソースから <code>corp.example.com</code> を名前解決できること</li>
        <li>DNS 基盤は<strong>高可用性</strong>で、<strong>運用負荷を最小化</strong>する</li>
      </ul>`,
    question: "最も適切な設計はどれか。",
    options: {
      A: "各 VPC に BIND をインストールした EC2 インスタンスを 2 台ずつ配置し、DHCP オプションセットでそれらを DNS サーバーに指定する。BIND でオンプレミス DNS との双方向の条件付きフォワーディングを設定する。",
      B: "共有サービス VPC に Route 53 Resolver のインバウンドエンドポイントとアウトバウンドエンドポイントを作成する。オンプレミス DNS には aws.example.internal をインバウンドエンドポイントの IP に転送する条件付きフォワーダーを設定する。corp.example.com をオンプレミス DNS へ転送する Resolver ルールを作成し、AWS RAM で各アカウントに共有してすべての VPC に関連付ける。",
      C: "各 VPC の DHCP オプションセットで、オンプレミスの DNS サーバーの IP アドレスを DNS サーバーとして指定する。",
      D: "aws.example.internal をパブリックホストゾーンに変更し、オンプレミスからインターネット経由で名前解決できるようにする。"
    },
    answer: ["B"],
    summary: `正解は <strong>B</strong>。ハイブリッド DNS は <strong>Route 53 Resolver エンドポイント（インバウンド / アウトバウンド）+ 転送ルール</strong>が AWS のマネージドな定番構成で、ルールは RAM で複数アカウントに共有できます。`,
    why: {
      A: `機能的には実現できるが、EC2 上の DNS サーバーの<strong>冗長化・パッチ・監視が必要</strong>で、VPC ごとに配置するため運用負荷が非常に高い。`,
      B: `<strong>インバウンドエンドポイント</strong>はオンプレミス → AWS、<strong>アウトバウンドエンドポイント + 転送ルール</strong>は AWS → オンプレミスの名前解決を担う。いずれもマネージドで複数 AZ に ENI を配置して高可用性を確保でき、転送ルールは <strong>AWS RAM で共有</strong>して全 VPC に関連付けられる。`,
      C: `VPC のリソースはオンプレミス DNS に問い合わせることになるが、オンプレミス DNS は<strong>プライベートホストゾーンを解決できない</strong>ため、VPC 内の名前解決が壊れる。オンプレミス → AWS 方向の要件も満たさない。`,
      D: `内部のホスト名と IP を<strong>インターネットに公開</strong>することになり、セキュリティ上不適切。VPC → オンプレミス方向の要件も満たさない。`
    },
    points: [
      `<strong>インバウンド</strong> = 外（オンプレミス）から VPC の DNS へ入ってくる、<strong>アウトバウンド</strong> = VPC から外の DNS へ出ていく、と覚える。`,
      `プライベートホストゾーンは、インバウンドエンドポイントを置いた VPC に<strong>関連付け</strong>が必要。他アカウントの VPC との関連付けも可能。`,
      `Resolver ルールは <strong>AWS RAM で共有</strong>できるため、アウトバウンドエンドポイントは共有サービス VPC に 1 組あれば足りる。`,
      `VPC の <code>.2</code> アドレス（Amazon Provided DNS）はオンプレミスから直接は問い合わせできない点がひっかけになりやすい。`
    ]
  },

  /* ---------- 11 ---------- */
  {
    id: 11,
    services: ["global-accelerator"],
    domain: D2,
    title: "グローバルな UDP ゲームの低レイテンシー化",
    scenario: `
      <p>あるゲーム会社は、リアルタイム対戦ゲームのサーバーを us-east-1、eu-west-1、ap-northeast-1 の 3 リージョンで運用している。各リージョンでは <strong>UDP</strong> で通信するゲームサーバーが Network Load Balancer（NLB）の背後に配置されている。</p>
      <ul class="reqs">
        <li>世界中のプレイヤーに<strong>低レイテンシー・低ジッター</strong>な接続を提供したい</li>
        <li>企業ネットワークからの接続のため、ファイアウォールの許可リストに登録できる<strong>固定 IP アドレス</strong>が必要</li>
        <li>リージョン障害時は、<strong>クライアント側の DNS キャッシュに左右されず</strong>数十秒程度で他リージョンへ切り替えたい</li>
      </ul>`,
    question: "これらの要件を満たす最適な構成はどれか。",
    options: {
      A: "Amazon CloudFront ディストリビューションを作成し、各リージョンの NLB をオリジンとしてオリジンフェイルオーバーを構成する。",
      B: "Route 53 のレイテンシーベースルーティングで各リージョンの NLB を指すレコードを作成し、ヘルスチェックを関連付けて TTL を 60 秒に設定する。",
      C: "AWS Global Accelerator のアクセラレーターを作成し、UDP リスナーを設定する。リージョンごとにエンドポイントグループを作成して各リージョンの NLB を登録し、ヘルスチェックを有効にする。",
      D: "ap-northeast-1 にゲームサーバーを集約し、大きなインスタンスタイプに変更する。海外のプレイヤーには AWS Site-to-Site VPN での接続を案内する。"
    },
    answer: ["C"],
    summary: `正解は <strong>C</strong>。<strong>UDP</strong>・<strong>固定 IP（エニーキャスト）</strong>・<strong>DNS に依存しない高速フェイルオーバー</strong>の組み合わせは AWS Global Accelerator の典型的なユースケースです。`,
    why: {
      A: `CloudFront は <strong>HTTP/HTTPS（および WebSocket）</strong>のためのサービスで、<strong>UDP は扱えない</strong>。固定 IP の要件も満たさない。`,
      B: `レイテンシーに応じた振り分けはできるが、切り替えは DNS 頼みで、クライアントや中間リゾルバーの<strong>キャッシュにより切り替えが遅れる</strong>ことがある。また複数リージョンの NLB の IP を許可リストに登録する必要があり、<strong>固定 IP の要件</strong>にも合わない。`,
      C: `Global Accelerator は 2 つの<strong>静的エニーキャスト IP</strong> を提供し、プレイヤーを最寄りのエッジから <strong>AWS グローバルネットワーク</strong>経由で最適なリージョンへ届ける。TCP/<strong>UDP</strong> に対応し、ヘルスチェックに基づいて <strong>DNS を介さず</strong>トラフィックを切り替えるため、要件をすべて満たす。`,
      D: `1 リージョンへの集約では海外プレイヤーのレイテンシーが悪化し、リージョン障害への耐性もなくなる。VPN を案内するのも一般プレイヤー向けとしては非現実的。`
    },
    extra: `
      <h3>CloudFront と Global Accelerator の違い</h3>
      <div class="table-wrap">
        <table>
          <thead><tr><th>観点</th><th>CloudFront</th><th>Global Accelerator</th></tr></thead>
          <tbody>
            <tr><td>プロトコル</td><td>HTTP/HTTPS、WebSocket</td><td>TCP、UDP</td></tr>
            <tr><td>キャッシュ</td><td>あり（エッジでコンテンツをキャッシュ）</td><td>なし（通信経路の最適化のみ）</td></tr>
            <tr><td>IP アドレス</td><td>可変</td><td>静的エニーキャスト IP × 2</td></tr>
            <tr><td>主な用途</td><td>Web コンテンツ・API の配信</td><td>ゲーム、IoT、VoIP、マルチリージョンでの高速フェイルオーバー</td></tr>
          </tbody>
        </table>
      </div>`,
    points: [
      `「<strong>UDP</strong>」「<strong>固定 IP / 許可リスト</strong>」「<strong>DNS キャッシュに依存しないフェイルオーバー</strong>」→ Global Accelerator。`,
      `エンドポイントグループごとに<strong>トラフィックダイヤル</strong>で流量の割合を調整でき、ブルー/グリーンデプロイにも使える。`,
      `キャッシュ可能な静的コンテンツ配信なら CloudFront。両者は競合ではなく用途で使い分ける。`
    ]
  },

  /* ---------- 12 ---------- */
  {
    id: 12,
    services: ["rds-proxy"],
    domain: D3,
    title: "Lambda から RDB への接続枯渇",
    scenario: `
      <p>あるスタートアップは、API Gateway + AWS Lambda のサーバーレス API から <strong>Amazon Aurora MySQL</strong> に接続している。Lambda 関数はハンドラーの中で毎回 DB 接続を開いている。</p>
      <p>トラフィックが急増すると Lambda の同時実行数が数千に達し、Aurora 側で <strong><code>Too many connections</code></strong> エラーが多発する。また、Aurora のフェイルオーバー時にアプリのエラーが長く続くことも課題になっている。</p>
      <ul class="reqs">
        <li>アプリケーションコードの<strong>変更は最小限</strong>にしたい</li>
        <li>ピーク時の<strong>スループットは落としたくない</strong></li>
        <li>DB の認証情報はコードに埋め込まず、安全に管理したい</li>
      </ul>`,
    question: "最も適切な解決策はどれか。",
    options: {
      A: "Aurora のインスタンスクラスを大きくし、DB クラスターパラメータグループで max_connections の値を引き上げる。",
      B: "Amazon RDS Proxy を作成して Aurora クラスターをターゲットに設定し、認証情報は AWS Secrets Manager で管理する。Lambda の接続先を RDS Proxy のエンドポイントに変更する。",
      C: "Lambda 関数の予約済み同時実行数を 100 に設定し、DB 接続数が上限を超えないようにする。",
      D: "Aurora レプリカを 3 台追加し、Lambda からの接続をリーダーエンドポイントに分散させる。"
    },
    answer: ["B"],
    summary: `正解は <strong>B</strong>。RDS Proxy は<strong>接続プーリング</strong>によって大量の Lambda からの接続を少数の DB 接続に集約し、<strong>フェイルオーバー時間の短縮</strong>や Secrets Manager / IAM 認証との連携も提供します。`,
    why: {
      A: `一時的には緩和できるが、同時実行数が増えれば再び上限に達する。<strong>根本解決にならず、コストも増える</strong>。フェイルオーバーの課題も残る。`,
      B: `RDS Proxy がアプリと DB の間で<strong>接続をプール・再利用</strong>するため、Lambda の同時実行数が急増しても DB 接続数は抑えられる。アプリ側は<strong>接続先エンドポイントを変えるだけ</strong>。フェイルオーバー時もプロキシが接続を保持するため、アプリから見た<strong>切り替え時間が短くなる</strong>。認証情報は Secrets Manager で管理できる。`,
      C: `接続数は抑えられるが、同時実行が 100 を超えたリクエストは<strong>スロットリング</strong>されるため「スループットを落とさない」要件に反する。`,
      D: `リーダーエンドポイントは<strong>読み取り専用</strong>。書き込みを含む処理には使えず、ライターへの接続数の問題は解決しない。`
    },
    points: [
      `「Lambda + RDB」「接続数の枯渇」→ <strong>RDS Proxy</strong> が定番。`,
      `RDS Proxy は<strong>フェイルオーバー時間の短縮</strong>、<strong>IAM 認証</strong>、<strong>Secrets Manager 連携</strong>もセットで覚える。`,
      `Lambda では DB 接続をハンドラーの外（初期化処理）で作成し、実行環境の再利用時に使い回すのも基本テクニック。`,
      `予約済み同時実行数は「下流を守る」手段だが、スロットリングとのトレードオフになる。`
    ]
  },

  /* ---------- 13 ---------- */
  {
    id: 13,
    services: ["iam-identity-center"],
    domain: D1,
    title: "多数アカウントへのシングルサインオン",
    scenario: `
      <p>ある企業は AWS Organizations で 60 個のアカウントを運用している。現在は各アカウントに IAM ユーザーを個別に作成しており、入退社時の作業漏れが監査で指摘された。従業員の ID は <strong>Microsoft Entra ID</strong> で管理されている。</p>
      <ul class="reqs">
        <li>従業員は既存の社内 ID で、<strong>すべての AWS アカウント</strong>にシングルサインオンできること</li>
        <li>入社・退社・部署異動が<strong>自動的に反映</strong>されること</li>
        <li>アクセス権は<strong>グループ単位</strong>で、アカウントごとに一元的に割り当てたい</li>
        <li><strong>長期的なアクセスキーを使わず</strong>、運用負荷を最小化したい</li>
      </ul>`,
    question: "最も適切な方法はどれか。",
    options: {
      A: "CloudFormation StackSets で全アカウントに同じ IAM ユーザーと IAM グループを作成し、退職者は人事システムと連携した Lambda 関数で自動削除する。",
      B: "AWS IAM Identity Center を有効化し、Microsoft Entra ID を外部 ID プロバイダーとして SAML 2.0 で接続する。SCIM による自動プロビジョニングを有効にし、権限セットを作成して Entra ID のグループと各アカウントに割り当てる。",
      C: "各アカウントで Microsoft Entra ID を SAML ID プロバイダーとして登録し、アカウントごとに IAM ロールを作成して Entra ID 側で各ロールへのマッピングを設定する。",
      D: "Amazon Cognito ユーザープールを作成して Entra ID とフェデレーションし、Cognito で認証したユーザーに各アカウントの IAM ユーザーの認証情報を払い出す。"
    },
    answer: ["B"],
    summary: `正解は <strong>B</strong>。マルチアカウント環境の従業員アクセスは <strong>IAM Identity Center + 外部 IdP（SAML）+ SCIM</strong> が AWS 推奨の構成です。`,
    why: {
      A: `IAM ユーザーは<strong>長期的な認証情報</strong>を持つため要件に反する。60 アカウント分のユーザー管理と自前の自動削除の仕組みも<strong>運用負荷が高い</strong>。`,
      B: `Identity Center は Organizations と統合されており、<strong>全アカウントへの SSO</strong> を一元管理できる。<strong>SCIM</strong> で Entra ID のユーザー・グループが自動同期されるため入退社がすぐ反映され、<strong>権限セット</strong>をグループとアカウントに割り当てるだけで各アカウントに IAM ロールが自動作成される。認証情報は一時的なもののみ。`,
      C: `機能的には SSO を実現できるが、<strong>アカウントごとに</strong> IdP 登録・ロール作成・Entra ID 側のマッピングが必要で、60 アカウントでは<strong>運用負荷が大きい</strong>。`,
      D: `Cognito は<strong>アプリケーションのエンドユーザー</strong>向けの認証サービスで、従業員の AWS アカウントへのアクセス管理には適さない。IAM ユーザーの認証情報を払い出すのも不適切。`
    },
    points: [
      `「従業員」「複数アカウント」「SSO」→ <strong>IAM Identity Center</strong>。「アプリのエンドユーザー」→ <strong>Cognito</strong>。`,
      `<strong>SAML</strong> は認証（サインイン）、<strong>SCIM</strong> はユーザー・グループの自動プロビジョニング、と役割を区別する。`,
      `権限セットを割り当てると、各アカウントに <code>AWSReservedSSO_...</code> という IAM ロールが自動作成される。`,
      `Identity Center は管理アカウントではなく<strong>委任管理者</strong>アカウントから管理することも推奨されている。`
    ]
  },

  /* ---------- 14 ---------- */
  {
    id: 14,
    services: ["kinesis-data-streams"],
    domain: D2,
    title: "クリックストリームのリアルタイム処理",
    scenario: `
      <p>あるメディア企業は、Web サイトとモバイルアプリのクリックストリームを収集する基盤を新たに構築する。ピーク時は<strong>毎秒約 5 万件</strong>のイベントが発生する。</p>
      <ul class="reqs">
        <li><strong>不正検知</strong>アプリと<strong>レコメンド</strong>アプリが、同じイベントを<strong>それぞれ独立して</strong> 1 秒以内に処理する</li>
        <li>同じユーザーセッション内のイベントは<strong>発生順に</strong>処理する</li>
        <li>処理ロジックに不具合があった場合に備え、過去 <strong>7 日分のイベントを再処理（リプレイ）</strong>できること</li>
      </ul>`,
    question: "これらの要件を満たす最適なサービス構成はどれか。",
    options: {
      A: "Amazon SQS FIFO キューにセッション ID をメッセージグループ ID として送信し、不正検知アプリとレコメンドアプリが同じキューからメッセージを受信して処理する。",
      B: "Amazon SNS 標準トピックにイベントを発行し、不正検知用とレコメンド用の 2 つの SQS 標準キューをサブスクライブさせる。",
      C: "Amazon Kinesis Data Streams にセッション ID をパーティションキーとしてイベントを送信し、データ保持期間を 7 日に設定する。各アプリは拡張ファンアウトのコンシューマーとして登録する。",
      D: "Amazon Data Firehose でイベントを Amazon S3 に配信し、各アプリは Amazon Athena で S3 のデータを定期的にクエリして処理する。"
    },
    answer: ["C"],
    summary: `正解は <strong>C</strong>。<strong>複数の独立したコンシューマー</strong>、<strong>キー単位の順序保証</strong>、<strong>保持期間内のリプレイ</strong>を同時に満たすのは Kinesis Data Streams です。`,
    why: {
      A: `SQS ではメッセージは<strong>1 つのコンシューマーが処理して削除</strong>すると消える。2 つのアプリが同じキューを読むと<strong>イベントを奪い合う</strong>ことになり、それぞれが全イベントを処理できない。<strong>リプレイもできない</strong>。`,
      B: `ファンアウトで両アプリに配信はできるが、標準トピック・標準キューは<strong>順序を保証しない</strong>。また処理済みメッセージは削除されるため<strong>過去 7 日分のリプレイができない</strong>。`,
      C: `Kinesis Data Streams はシャード内で<strong>パーティションキーごとの順序</strong>を保証し、データは保持期間（最大 365 日）の間ストリームに残るため<strong>任意の時点から再処理</strong>できる。<strong>拡張ファンアウト</strong>により、各コンシューマーがシャードごとに専用の読み取りスループットを持ち、低レイテンシーで独立して処理できる。`,
      D: `Firehose はバッファリングして配信先へ届けるサービスで、Athena での定期クエリでは <strong>1 秒以内のリアルタイム処理</strong>を実現できない。`
    },
    points: [
      `「<strong>複数コンシューマーが同じデータを独立に読む</strong>」「<strong>リプレイ</strong>」「<strong>順序</strong>」→ Kinesis Data Streams。`,
      `「<strong>処理したら消える</strong>」「<strong>ワーカーで分散処理</strong>」→ SQS。`,
      `拡張ファンアウトはコンシューマーごとにシャードあたり 2 MB/秒の専用スループット。通常の共有スループットはシャードあたり 2 MB/秒を全コンシューマーで分け合う。`,
      `Firehose は「S3 / Redshift / OpenSearch などへの<strong>配信</strong>」が主目的で、ニアリアルタイム（バッファあり）。`
    ]
  },

  /* ---------- 15 ---------- */
  {
    id: 15,
    services: ["session-manager"],
    domain: D3,
    title: "踏み台サーバーの廃止とセキュアな運用アクセス",
    scenario: `
      <p>ある企業では、プライベートサブネット上の数百台の EC2 インスタンス（Linux と Windows）に、パブリックサブネットの<strong>踏み台サーバー経由の SSH / RDP</strong> でログインして運用している。セキュリティ監査で以下の改善を求められた。</p>
      <ul class="reqs">
        <li>インスタンスへの<strong>インバウンドポート（22 / 3389）を一切開放しない</strong></li>
        <li>SSH 鍵の配布・管理をやめ、<strong>IAM</strong> でアクセスを制御する</li>
        <li>操作セッションの<strong>ログ（実行したコマンド）を記録</strong>し、S3 に保存する</li>
        <li>プライベートサブネットには<strong>インターネットへの経路がない</strong></li>
      </ul>`,
    question: "最も適切な方法はどれか。",
    options: {
      A: "踏み台サーバーのセキュリティグループを社内の固定 IP アドレスからの接続のみに制限し、踏み台サーバーへのログインに MFA を必須化する。",
      B: "各インスタンスに SSM Agent と AmazonSSMManagedInstanceCore ポリシーを含むインスタンスプロファイルを設定し、Systems Manager 用のインターフェイス VPC エンドポイントを作成する。AWS Systems Manager Session Manager で接続し、セッションログを S3 に出力するよう設定する。",
      C: "AWS Client VPN エンドポイントを作成し、VPN 接続したクライアントからプライベート IP アドレスで各インスタンスに SSH / RDP で直接接続する。",
      D: "各インスタンスにパブリック IP アドレスを割り当て、EC2 Instance Connect で一時的な SSH 公開鍵をプッシュして接続する。"
    },
    answer: ["B"],
    summary: `正解は <strong>B</strong>。<strong>Session Manager</strong> はインバウンドポートを開けずに、IAM で制御されたシェル / RDP 接続を提供し、セッションログを S3 や CloudWatch Logs に記録できます。`,
    why: {
      A: `踏み台へのアクセスは絞れるが、<strong>インバウンドポートの開放</strong>も <strong>SSH 鍵の管理</strong>も残り、コマンドログの記録も別途必要。要件を満たさない。`,
      B: `SSM Agent が<strong>アウトバウンド HTTPS</strong> で Systems Manager に接続する仕組みのため、<strong>インバウンドポートは不要</strong>。インターネット経路がなくても <strong>VPC エンドポイント</strong>（<code>ssm</code>、<code>ssmmessages</code> など）経由で通信できる。アクセスは IAM ポリシーで制御し、セッションログを S3 / CloudWatch Logs に保存できる。Windows には Fleet Manager から RDP 接続も可能。`,
      C: `VPN で到達経路は確保できるが、インスタンス側で <strong>22 / 3389 を開放</strong>する必要があり、SSH 鍵の管理も残る。`,
      D: `インスタンスを<strong>パブリックに公開</strong>することになり、インバウンドの 22 番ポートも必要。セキュリティが後退する。`
    },
    points: [
      `「インバウンドポートを開けない」「鍵管理不要」「操作ログ」→ <strong>Session Manager</strong>。`,
      `インターネット経路がない場合は Systems Manager 用の <strong>インターフェイス VPC エンドポイント</strong>が必要。`,
      `Session Manager はポートフォワーディングにも対応しており、プライベートな RDS などへの踏み台としても使える。`,
      `EC2 Instance Connect Endpoint もパブリック IP なしで SSH 接続できるが、インスタンス側のセキュリティグループで 22 番ポートの許可が必要。`
    ]
  },

  /* ---------- 16 ---------- */
  {
    id: 16,
    services: ["fsx-windows","datasync"],
    domain: D4,
    title: "Windows ファイルサーバーの移行",
    scenario: `
      <p>ある企業は、オンプレミスの Windows ファイルサーバー（約 30 TB）を AWS に移行する。ファイルサーバーは <strong>SMB</strong> で共有され、<strong>Active Directory</strong> と統合された <strong>NTFS のアクセス権（ACL）</strong>でフォルダごとの権限を管理している。</p>
      <ul class="reqs">
        <li>既存の<strong>ACL とファイルのメタデータを維持</strong>したまま移行する</li>
        <li>移行後は Windows サーバーの OS パッチやストレージ管理をしない<strong>フルマネージド</strong>な構成にする</li>
        <li><strong>AZ 障害</strong>が発生してもファイル共有を継続して利用できること</li>
      </ul>`,
    question: "最も適切な移行先と移行方法はどれか。",
    options: {
      A: "Amazon EFS を作成し、AWS DataSync でファイルを転送する。Windows クライアントから EFS をマウントする。",
      B: "Amazon S3 File Gateway をオンプレミスに配置して SMB 共有を作成し、既存のファイルを Robocopy でコピーして S3 に保存する。",
      C: "Amazon FSx for Windows File Server をマルチ AZ 構成で作成して Active Directory に参加させ、AWS DataSync で ACL を含むメタデータを保持したままファイルを転送する。",
      D: "Amazon FSx for Lustre を作成し、Amazon S3 をデータリポジトリとして関連付けてファイルを転送する。"
    },
    answer: ["C"],
    summary: `正解は <strong>C</strong>。<strong>SMB・Active Directory・NTFS ACL</strong> をネイティブにサポートするフルマネージドなファイルサーバーは FSx for Windows File Server です。マルチ AZ 構成で AZ 障害にも対応できます。`,
    why: {
      A: `EFS は <strong>NFS</strong> プロトコルのファイルシステムで、主に Linux 向け。<strong>SMB や NTFS ACL はサポートしない</strong>。`,
      B: `S3 File Gateway はオンプレミスから S3 に SMB / NFS でアクセスするための<strong>ハイブリッド</strong>なサービス。データは S3 オブジェクトとして保存され、オンプレミスのゲートウェイ自体の管理も残るため、<strong>フルマネージドなファイルサーバーの置き換え</strong>には適さない。`,
      C: `FSx for Windows File Server は Windows Server 上に構築されたフルマネージドサービスで、<strong>SMB・AD 統合・NTFS ACL・DFS 名前空間</strong>などをそのまま利用できる。<strong>マルチ AZ</strong> 構成なら AZ 障害時も自動でフェイルオーバーする。DataSync は SMB 間転送で <strong>NTFS ACL やタイムスタンプを保持</strong>できる。`,
      D: `FSx for Lustre は <strong>HPC・機械学習</strong>向けの高性能な Linux 用ファイルシステムで、SMB や Windows の ACL には対応しない。`
    },
    extra: `
      <h3>ファイルストレージの使い分け</h3>
      <div class="table-wrap">
        <table>
          <thead><tr><th>サービス</th><th>プロトコル</th><th>主な用途</th></tr></thead>
          <tbody>
            <tr><td>Amazon EFS</td><td>NFS</td><td>Linux の共有ファイルシステム</td></tr>
            <tr class="hit"><td>FSx for Windows File Server</td><td>SMB</td><td>Windows のファイル共有、AD 統合</td></tr>
            <tr><td>FSx for NetApp ONTAP</td><td>NFS / SMB / iSCSI</td><td>マルチプロトコル、NetApp からの移行</td></tr>
            <tr><td>FSx for Lustre</td><td>Lustre</td><td>HPC、機械学習</td></tr>
            <tr><td>FSx for OpenZFS</td><td>NFS</td><td>ZFS からの移行、低レイテンシー</td></tr>
          </tbody>
        </table>
      </div>`,
    points: [
      `「<strong>SMB</strong>」「<strong>Active Directory</strong>」「<strong>NTFS ACL</strong>」→ FSx for Windows File Server。`,
      `AD は AWS Managed Microsoft AD に参加させることも、オンプレミスの自己管理 AD に直接参加させることもできる。`,
      `ファイルの移行は <strong>DataSync</strong>（ACL 保持、スケジュール、整合性検証）が定番。Robocopy も使えるが運用は手動になる。`
    ]
  },

  /* ---------- 17 ---------- */
  {
    id: 17,
    services: ["waf"],
    domain: D2,
    title: "CloudFront + ALB の Web アプリ保護",
    scenario: `
      <p>ある企業は、Application Load Balancer（ALB）をオリジンとする Amazon CloudFront ディストリビューションで Web アプリケーションを公開している。セキュリティ診断で以下の指摘を受けた。</p>
      <ul class="reqs">
        <li><strong>SQL インジェクション</strong>や<strong>クロスサイトスクリプティング（XSS）</strong>などの一般的な攻撃を防ぐ仕組みがない</li>
        <li>ALB の DNS 名に直接アクセスすると、<strong>CloudFront を経由せずに</strong>アプリを利用できてしまう</li>
      </ul>
      <p>対策は<strong>運用負荷が低い</strong>ものにしたい。</p>`,
    question: "これらの指摘に対応するために実施すべき対策はどれか。（2 つ選択）",
    options: {
      A: "AWS WAF のウェブ ACL を作成し、AWS マネージドルール（コアルールセット、SQL データベースルールなど）を追加して CloudFront ディストリビューションに関連付ける。",
      B: "ALB のセキュリティグループのインバウンドを CloudFront のオリジン向けマネージドプレフィックスリストのみに制限する。さらに CloudFront からオリジンへのリクエストに秘密の値を持つカスタムヘッダーを付与し、ALB のリスナールールでそのヘッダーがある場合のみ転送する。",
      C: "AWS Shield Advanced をサブスクライブし、CloudFront ディストリビューションと ALB を保護対象リソースとして登録する。",
      D: "ALB のサブネットのネットワーク ACL に、AWS が公開している CloudFront の IP アドレス範囲をすべて許可ルールとして登録し、それ以外を拒否する。",
      E: "Amazon GuardDuty を有効化し、検出結果を Amazon EventBridge 経由で通知する。"
    },
    answer: ["A", "B"],
    summary: `正解は <strong>A と B</strong>。アプリケーション層の攻撃は <strong>AWS WAF</strong> で防ぎ、オリジンへの直接アクセスは<strong>マネージドプレフィックスリスト + カスタムヘッダー</strong>で遮断するのが定番です。`,
    why: {
      A: `AWS WAF は <strong>L7 の攻撃（SQLi、XSS など）</strong>をブロックできる。<strong>AWS マネージドルール</strong>を使えばルールの作成や更新を自分で行う必要がなく、運用負荷が低い。CloudFront に関連付ければエッジで攻撃を遮断できる。`,
      B: `マネージドプレフィックスリスト（<code>com.amazonaws.global.cloudfront.origin-facing</code>）で <strong>CloudFront 以外からの通信を遮断</strong>できる。ただしこれだけでは<strong>他人の CloudFront ディストリビューション</strong>経由のアクセスは通ってしまうため、<strong>カスタムヘッダー</strong>の検証を組み合わせて自分のディストリビューション経由に限定する。`,
      C: `Shield Advanced は <strong>DDoS 攻撃</strong>への高度な防御とレスポンスチームのサポートを提供するもので、SQLi や XSS を直接防ぐものではない。オリジンへの直接アクセスの問題も解決しない。`,
      D: `CloudFront の IP 範囲は数が多く<strong>頻繁に変わる</strong>。ネットワーク ACL はルール数の上限が小さく、手動での更新は<strong>運用負荷が高い</strong>。`,
      E: `GuardDuty は脅威の<strong>検出</strong>サービスであり、リクエストを<strong>ブロックしない</strong>。`
    },
    points: [
      `「SQLi / XSS」「L7 攻撃」→ <strong>AWS WAF</strong>。「大規模 DDoS」「DRT のサポート」「コスト保護」→ <strong>Shield Advanced</strong>。`,
      `オリジン保護は「<strong>プレフィックスリスト</strong>」＋「<strong>カスタムヘッダー</strong>」の組み合わせが頻出。`,
      `新しい選択肢として <strong>CloudFront VPC オリジン</strong>を使うと、ALB をプライベートサブネットに置いたまま CloudFront からのみアクセスさせることもできる。`,
      `S3 オリジンの場合は <strong>オリジンアクセスコントロール（OAC）</strong>でバケットへの直接アクセスを防ぐ。`
    ]
  },

  /* ---------- 18 ---------- */
  {
    id: 18,
    services: ["s3-intelligent-tiering"],
    domain: D3,
    title: "アクセスパターンが予測できないデータのストレージコスト",
    scenario: `
      <p>ある研究機関は、Amazon S3 Standard に約 2 PB の研究データを保存している。データの多くは作成後しばらくするとほとんど参照されなくなるが、<strong>論文の再検証などで数年前のデータに突然アクセスが集中する</strong>ことがあり、どのデータがいつ使われるかは予測できない。</p>
      <ul class="reqs">
        <li>ストレージコストを<strong>削減</strong>したい</li>
        <li>どのデータにも<strong>ミリ秒単位</strong>でアクセスできること</li>
        <li>アクセスのたびに<strong>取り出し料金</strong>が発生するのは避けたい</li>
        <li>階層の見直しなどの<strong>運用作業は行いたくない</strong></li>
      </ul>
      <p>なお、オブジェクトの大半は数 MB 以上のサイズである。</p>`,
    question: "最も適切な方法はどれか。",
    options: {
      A: "ライフサイクルルールを設定し、作成後 30 日で S3 Standard-IA、90 日で S3 Glacier Flexible Retrieval に移行する。",
      B: "オブジェクトを S3 Intelligent-Tiering に移行する。",
      C: "すべてのオブジェクトを S3 One Zone-IA に移行する。",
      D: "S3 Storage Lens でアクセス状況を毎月分析し、アクセスの少ないプレフィックスを手動で S3 Glacier Instant Retrieval に移動する。"
    },
    answer: ["B"],
    summary: `正解は <strong>B</strong>。<strong>アクセスパターンが不明・変化する</strong>データには S3 Intelligent-Tiering が最適です。アクセス状況に応じて自動で階層を移動し、<strong>取り出し料金はかかりません</strong>。`,
    why: {
      A: `Standard-IA は<strong>取り出し料金</strong>が発生し、Glacier Flexible Retrieval は取り出しに<strong>数分〜数時間</strong>かかるため、ミリ秒アクセスの要件を満たさない。突然のアクセス集中時にコストも跳ね上がる。`,
      B: `Intelligent-Tiering は 30 日アクセスがないと低頻度アクセス階層、90 日でアーカイブインスタントアクセス階層へ<strong>自動で移動</strong>し、アクセスされると高頻度階層に戻す。いずれの階層も<strong>ミリ秒でアクセス可能</strong>で、<strong>取り出し料金なし</strong>。オブジェクトごとの少額のモニタリング料金のみで運用作業も不要。`,
      C: `One Zone-IA は<strong>1 つの AZ にのみ保存</strong>されるため、AZ の障害でデータを失うリスクがあり、貴重な研究データの保存には不適切。取り出し料金も発生する。`,
      D: `毎月の分析と手動移動は<strong>運用作業</strong>そのもの。Glacier Instant Retrieval は<strong>取り出し料金が高い</strong>ため、アクセスが集中した場合にコストが増える。`
    },
    points: [
      `「<strong>アクセスパターンが不明・変化する</strong>」→ S3 Intelligent-Tiering。`,
      `「<strong>アクセスパターンが明確</strong>（例：90 日後はほぼ参照されない）」→ ライフサイクルルールで適切なクラスへ移行。`,
      `Intelligent-Tiering では <strong>128 KB 未満のオブジェクト</strong>は自動階層化の対象外（常に高頻度階層の料金）。`,
      `オプションの<strong>アーカイブアクセス / ディープアーカイブアクセス階層</strong>を有効にするとさらに安くなるが、取り出しは非同期（分〜時間単位）になる。`
    ]
  },

  /* ---------- 19 ---------- */
  {
    id: 19,
    services: ["datasync"],
    domain: D4,
    title: "大量ファイルのオンライン移行",
    scenario: `
      <p>ある企業は、オンプレミスの NAS（NFS 共有、約 200 TB・5,000 万ファイル）のデータを Amazon S3 に移行し、2 か月後に NAS を撤去する予定である。オンプレミスと AWS は <strong>10 Gbps の Direct Connect</strong> で接続されている。</p>
      <ul class="reqs">
        <li>移行期間中も NAS は業務で使われ続けるため、<strong>差分を繰り返し同期</strong>してから最終切り替えを行う</li>
        <li>転送したデータの<strong>整合性を検証</strong>したい</li>
        <li>業務時間帯は他の通信への影響を避けるため、<strong>転送帯域を制限</strong>したい</li>
        <li>移行作業の<strong>運用負荷を最小化</strong>したい</li>
      </ul>`,
    question: "最も適切な移行方法はどれか。",
    options: {
      A: "オンプレミスのサーバーに AWS CLI をインストールし、aws s3 sync コマンドを cron で定期実行するスクリプトを作成する。転送後にファイル数とサイズを比較するスクリプトも作成する。",
      B: "オンプレミスに AWS DataSync エージェントを配置し、NFS 共有をソース、S3 バケットを宛先とするタスクを作成する。Direct Connect 経由で転送し、タスクのスケジュール実行・帯域制限・データ検証を設定する。",
      C: "AWS Transfer Family で SFTP サーバーを作成し、オンプレミスから SFTP クライアントで S3 にファイルをアップロードする。",
      D: "オンプレミスに Amazon S3 File Gateway を配置し、NAS のファイルを rsync でゲートウェイの共有にコピーする。"
    },
    answer: ["B"],
    summary: `正解は <strong>B</strong>。<strong>オンラインでの大量ファイル移行</strong>には AWS DataSync が最適です。差分転送、スケジュール実行、帯域制限、整合性検証を標準機能として備えています。`,
    why: {
      A: `転送はできるが、再試行・並列化・監視・整合性検証を<strong>自前で作り込む</strong>必要があり、5,000 万ファイル規模では<strong>運用負荷が高い</strong>。`,
      B: `DataSync は<strong>マルチスレッドの並列転送</strong>で回線を効率よく使い、<strong>変更があったファイルのみ</strong>を転送する。<strong>スケジュール実行</strong>、<strong>帯域制限</strong>、<strong>転送データの検証</strong>、メタデータの保持、CloudWatch での監視まで標準で提供され、要件をすべて満たす。`,
      C: `Transfer Family は SFTP / FTPS / FTP などで<strong>外部の取引先やユーザーがファイルをやり取り</strong>するためのサービス。大量データの一括移行には向かない。`,
      D: `S3 File Gateway はオンプレミスから S3 を<strong>継続的に利用</strong>するためのハイブリッドストレージ。移行に使うこともできるが、rsync での手動コピーとなり、検証やスケジュール管理を自前で行う必要がある。`
    },
    points: [
      `「<strong>オンライン</strong>で大量ファイルを移行」「スケジュール」「検証」→ <strong>DataSync</strong>。`,
      `転送時間の目安を計算できるようにしておく：200 TB ÷ 10 Gbps ≒ 約 2 日（理論値）。回線が細い・期限が短い場合はオフライン転送も検討する。`,
      `DataSync は NFS / SMB / HDFS / オブジェクトストレージと、S3 / EFS / FSx の間で転送できる。`,
      `移行後もオンプレミスから S3 をファイル共有として使い続けたい場合は <strong>Storage Gateway</strong> を検討する。`
    ]
  },

  /* ---------- 20 ---------- */
  {
    id: 20,
    services: ["aws-backup"],
    domain: D1,
    title: "組織全体のバックアップ統制",
    scenario: `
      <p>ある企業は AWS Organizations で約 100 個のアカウントを運用している。ランサムウェア対策の一環として、バックアップの統制を強化することになった。</p>
      <ul class="reqs">
        <li>全アカウントの EC2（EBS）と RDS を<strong>毎日バックアップ</strong>し、<strong>35 日間保持</strong>する方針を<strong>組織全体に一元的に適用</strong>する</li>
        <li>ワークロードのアカウントが侵害されても、バックアップを削除できないよう、<strong>専用のバックアップアカウント</strong>にコピーを保管する</li>
        <li>バックアップアカウントの管理者や root ユーザーでも、保持期間内のバックアップを<strong>削除できない</strong>こと</li>
        <li><strong>運用負荷を最小化</strong>する</li>
      </ul>`,
    question: "最も適切な方法はどれか。",
    options: {
      A: "各アカウントで Amazon Data Lifecycle Manager による EBS スナップショットポリシーと、RDS の自動バックアップ（保持期間 35 日）を設定する。",
      B: "CloudFormation StackSets で各アカウントに AWS Backup のバックアッププランを展開し、同じアカウント内の別リージョンのボールトにコピーする。",
      C: "AWS Organizations のバックアップポリシーで AWS Backup のバックアッププランを組織全体に適用し、専用のバックアップアカウントのボールトへのクロスアカウントコピーを設定する。コピー先のボールトには AWS Backup Vault Lock をコンプライアンスモードで設定する。",
      D: "各アカウントで Lambda 関数を定期実行して EBS と RDS のスナップショットを作成し、スナップショットをバックアップアカウントに共有してコピーする。"
    },
    answer: ["C"],
    summary: `正解は <strong>C</strong>。<strong>Organizations のバックアップポリシー</strong>で方針を一元適用し、<strong>クロスアカウントコピー</strong>と<strong>Vault Lock（コンプライアンスモード）</strong>で、侵害されても削除できないバックアップを確保します。`,
    why: {
      A: `バックアップ自体は取得できるが、各アカウントで個別に設定するため<strong>一元的な統制ができない</strong>。バックアップは同じアカウント内にあるため、<strong>アカウントが侵害されると削除される</strong>おそれがある。`,
      B: `別リージョンへのコピーはリージョン障害対策にはなるが、<strong>同じアカウント内</strong>にあるため侵害時の削除リスクは残る。<strong>削除防止</strong>の仕組みもない。`,
      C: `バックアップポリシーは<strong>新規アカウントを含む組織全体</strong>にバックアッププランを適用できる。クロスアカウントコピーで<strong>別アカウントにバックアップを隔離</strong>し、Vault Lock のコンプライアンスモードを設定すれば、猶予期間の終了後は <strong>root ユーザーを含め誰も</strong>保持期間内のバックアップを削除したりロックを解除したりできなくなる。`,
      D: `要件は満たせる可能性があるが、スナップショット作成・共有・コピー・削除をすべて<strong>自前のコードで実装・保守</strong>する必要があり、運用負荷が高い。削除防止の仕組みもない。`
    },
    points: [
      `「組織全体に<strong>バックアップ方針を強制</strong>」→ Organizations の <strong>バックアップポリシー</strong> + AWS Backup。`,
      `「<strong>削除できないバックアップ</strong>」→ <strong>AWS Backup Vault Lock</strong>。コンプライアンスモードは猶予期間後に変更・削除が不可能になり、ガバナンスモードは十分な権限があれば変更できる。`,
      `ランサムウェア対策は「<strong>別アカウントへの隔離</strong>」＋「<strong>イミュータブル（変更不可）</strong>」がセット。論理的にエアギャップされたボールトも選択肢になる。`,
      `S3 の場合は S3 オブジェクトロック、CloudTrail ログは組織の証跡 + オブジェクトロックと、「改ざん防止」の手段をサービスごとに整理しておく。`
    ]
  }
];
