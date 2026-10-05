import React, { useState, useEffect } from 'react';
import { DatabaseStats } from '../types';
import {
  X,
  Database,
  Terminal,
  Upload,
  BookOpen,
  Activity,
  Layers,
  Search,
  CheckCircle2,
  AlertCircle,
  Play,
  Clock,
  Globe,
  FileJson,
  Code,
  Download,
  Copy,
  Check
} from 'lucide-react';
import { convertText } from '../data/chineseConverter';

interface DataServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: 'chs' | 'cht';
  onSearchWithAlias: (alias: string) => void;
  onDataImported?: () => void;
}

export const DataServiceModal: React.FC<DataServiceModalProps> = ({
  isOpen,
  onClose,
  lang,
  onSearchWithAlias,
  onDataImported,
}) => {
  const [activeTab, setActiveTab] = useState<'metrics' | 'sql' | 'aliases' | 'import'>('import');
  const [stats, setStats] = useState<DatabaseStats | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(false);

  // SQL console state
  const [sqlQuery, setSqlQuery] = useState(
    'SELECT dynasty, count(*) as count FROM poems GROUP BY dynasty ORDER BY count DESC;'
  );
  const [sqlResult, setSqlResult] = useState<{
    columns: string[];
    values: any[][];
    rowCount: number;
    durationMs: number;
  } | null>(null);
  const [isExecutingSql, setIsExecutingSql] = useState(false);
  const [sqlError, setSqlError] = useState<string | null>(null);

  // Import states
  const [importMode, setImportMode] = useState<'preset' | 'file' | 'url' | 'cli' | 'json'>('preset');
  const [importJsonText, setImportJsonText] = useState('');
  const [remoteUrl, setRemoteUrl] = useState('https://cdn.jsdelivr.net/gh/chinese-poetry/chinese-poetry@master/shijing/shijing.json');
  const [isImporting, setIsImporting] = useState(false);
  const [importMessage, setImportMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [copiedCli, setCopiedCli] = useState(false);

  // Aliases state
  const [aliases, setAliases] = useState<Record<string, string>>({});

  const refreshStats = () => {
    setIsLoadingStats(true);
    fetch('/api/data/stats')
      .then((res) => res.json())
      .then((data) => {
        setStats(data);
        setIsLoadingStats(false);
      })
      .catch((err) => {
        console.error(err);
        setIsLoadingStats(false);
      });
  };

  useEffect(() => {
    if (!isOpen) return;

    refreshStats();

    // Fetch Aliases
    fetch('/api/data/aliases')
      .then((res) => res.json())
      .then((data) => {
        if (data.aliases) setAliases(data.aliases);
      })
      .catch(console.error);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleExecuteSql = async (overrideSql?: string) => {
    const queryToRun = overrideSql || sqlQuery;
    if (!queryToRun.trim()) return;

    setIsExecutingSql(true);
    setSqlError(null);

    try {
      const res = await fetch('/api/data/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sql: queryToRun }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'SQL 执行失败');
      }

      setSqlResult(data);
    } catch (err: any) {
      setSqlError(err.message || '查询失败');
      setSqlResult(null);
    } finally {
      setIsExecutingSql(false);
    }
  };

  // Preset Collections from chinese-poetry
  const handleLoadPresetPack = async (packType: 'shijing' | 'caocao' | 'tang' | 'songci') => {
    setIsImporting(true);
    setImportMessage(null);

    let packData: any[] = [];
    let packName = '';

    if (packType === 'shijing') {
      packName = '《诗经》名篇选';
      packData = [
        {
          title: '关雎',
          author: '佚名·国风·周南',
          dynasty: '先秦',
          genre: '诗经',
          paragraphs: [
            '关关雎鸠，在河之洲。窈窕淑女，君子好逑。',
            '参差荇菜，左右流之。窈窕淑女，寤寐求之。',
            '求之不得，寤寐思服。悠哉悠哉，辗转反侧。',
            '参差荇菜，左右采之。窈窕淑女，琴瑟友之。',
            '参差荇菜，左右芼之。窈窕淑女，钟鼓乐之。',
          ],
          famousLines: ['关关雎鸠，在河之洲。窈窕淑女，君子好逑。', '悠哉悠哉，辗转反侧。'],
          translation: '关关鸣叫的水鸟，栖息在河中的沙洲。美丽纯洁的姑娘，是君子心中的好配偶。长短不齐的荇菜，姑娘在水边左右采捞。美丽的姑娘日夜思慕，君子日思夜想翻来覆去难以入眠。',
          appreciation: '《诗经》的开卷第一篇，借水鸟相和之景起兴，表达青年男女纯真热烈而执着真挚的恋慕。',
          moods: ['婉约相思', '闲适山水'],
          imagery: ['河洲', '荇菜', '琴瑟', '钟鼓'],
        },
        {
          title: '蒹葭',
          author: '佚名·国风·秦风',
          dynasty: '先秦',
          genre: '诗经',
          paragraphs: [
            '蒹葭苍苍，白露为霜。所谓伊人，在水一方。',
            '溯洄从之，道阻且长。溯游从之，宛在水中央。',
            '蒹葭凄凄，白露未晞。所谓伊人，在水之湄。',
            '溯洄从之，道阻且跻。溯游从之，宛在水中坻。',
          ],
          famousLines: ['蒹葭苍苍，白露为霜。所谓伊人，在水一方。'],
          translation: '河畔芦苇青苍茂密，清晨白露凝结成霜。我日夜思慕的那个人，宛然伫立在河水对岸。逆流逆道去追寻她，道路艰险漫长；顺流而下追寻她，她仿佛就在水中小洲中央。',
          appreciation: '重章叠句，清旷悠远。虚实相生的追寻境界，将相思之情与凄清秋水融为一体。',
          moods: ['清冷孤寂', '婉约相思', '惜春感秋'],
          imagery: ['蒹葭', '白露', '秋水', '霜'],
        },
        {
          title: '桃夭',
          author: '佚名·国风·周南',
          dynasty: '先秦',
          genre: '诗经',
          paragraphs: [
            '桃之夭夭，灼灼其华。之子于归，宜其室家。',
            '桃之夭夭，有蕡其实。之子于归，宜其家室。',
            '桃之夭夭，其叶蓁蓁。之子于归，宜其家人。',
          ],
          famousLines: ['桃之夭夭，灼灼其华。之子于归，宜其室家。'],
          translation: '桃花繁盛艳丽，花朵绚烂如同火红朝霞。这位姑娘出嫁新婚，定能让家庭和睦美满。',
          appreciation: '以盛放的桃花起兴，为新婚女子送上美好纯朴的祝愿，充满生命的欢欣与丰沛生机。',
          moods: ['闲适山水'],
          imagery: ['桃花', '春风'],
        },
        {
          title: '采薇',
          author: '佚名·国风·小雅',
          dynasty: '先秦',
          genre: '诗经',
          paragraphs: [
            '采薇采薇，薇亦作止。曰归曰归，岁亦莫止。靡室靡家，玁狁之故。不遑启居，玁狁之故。',
            '昔我往矣，杨柳依依。今我来思，雨雪霏霏。',
            '行道迟迟，载渴载饥。我心伤悲，莫知我哀！',
          ],
          famousLines: ['昔我往矣，杨柳依依。今我来思，雨雪霏霏。'],
          translation: '回想当初我出发从军之时，杨柳在春风中依依飘拂；如今我终于走在还乡之路，大雪纷飞茫茫一片。行路艰难缓慢，又饥又渴。内心的悲伤愁苦，有谁能体察我的哀痛！',
          appreciation: '以春柳与寒雪对比物候与心境，被誉为古典诗歌中表现边关羁旅与思乡离乱的巅峰绝唱。',
          moods: ['羁旅思乡', '清冷孤寂', '惜春感秋'],
          imagery: ['杨柳', '雪', '春风'],
        },
      ];
    } else if (packType === 'caocao') {
      packName = '汉魏曹操诗选';
      packData = [
        {
          title: '短歌行',
          author: '曹操',
          dynasty: '两汉',
          genre: '古体诗',
          paragraphs: [
            '对酒当歌，人生几何！譬如朝露，去日苦多。',
            '慨当以慷，忧思难忘。何以解忧？唯有杜康。',
            '青青子衿，悠悠我心。但为君故，沉吟至今。',
            '呦呦鹿鸣，食野之苹。我有嘉宾，鼓瑟吹笙。',
            '山不厌高，海不厌深。周公吐哺，天下归心。',
          ],
          famousLines: ['对酒当歌，人生几何！', '何以解忧？唯有杜康。', '周公吐哺，天下归心。'],
          translation: '面对美酒应当高歌，人生究竟能有多长时间！好比清晨的朝露，逝去的岁月痛苦繁多。大山不满足于自己的高峻，沧海不满足于自己的深阔。我愿效仿周公礼贤下士，使天下贤才皆诚心归附！',
          appreciation: '曹操乐府诗代表作，借慷慨悲歌抒发建功立业与广纳天下贤良的雄心壮志。',
          moods: ['家国壮志', '豪放旷达'],
          imagery: ['酒', '明月', '山', '沧海'],
        },
        {
          title: '观沧海',
          author: '曹操',
          dynasty: '两汉',
          genre: '四言乐府',
          paragraphs: [
            '东临碣石，以观沧海。水何澹澹，山岛竦峙。',
            '树木丛生，百草丰茂。秋风萧瑟，洪波涌起。',
            '日月之行，若出其中；星汉灿烂，若出其里。',
            '幸甚至哉，歌以咏志。',
          ],
          famousLines: ['日月之行，若出其中；星汉灿烂，若出其里。'],
          translation: '东行登上碣石山，俯瞰茫茫大海。波涛汹涌，海岛耸立。树木郁郁葱葱，野草生机勃发。秋风萧瑟吹拂，激起滔天洪波。太阳与月亮的升降运行，仿佛孕育于沧海腹中；灿烂的银河星汉，也宛如从海浪中喷薄而出！',
          appreciation: '借浩瀚沧海与吞吐日月的气象，展现诗人北征乌桓胜利后胸怀万象的王者气概。',
          moods: ['豪放旷达', '家国壮志'],
          imagery: ['沧海', '秋风', '明月'],
        },
        {
          title: '龟虽寿',
          author: '曹操',
          dynasty: '两汉',
          genre: '四言乐府',
          paragraphs: [
            '神龟虽寿，犹有竟时；螣蛇乘雾，终为土灰。',
            '老骥伏枥，志在千里；烈士暮年，壮心不已。',
            '盈缩之期，不但在天；养怡之福，可得永年。',
            '幸甚至哉，歌以咏志。',
          ],
          famousLines: ['老骥伏枥，志在千里；烈士暮年，壮心不已。'],
          translation: '神龟虽然长寿，也终有生命终结之时；螣蛇虽能腾云驾雾，最后也会化为灰土。衰老的千里马伏在马槽旁，雄心依然奔向千里之外；有抱负的志士即便步入晚年，胸中激荡的壮志永远不会消歇！',
          appreciation: '破除天命迷信，洋溢着昂扬进取的人格力量与不屈不挠的生命尊严。',
          moods: ['家国壮志', '豪放旷达'],
          imagery: ['山', '剑'],
        },
      ];
    } else if (packType === 'tang') {
      packName = '全唐诗名家传世包';
      packData = [
        {
          title: '蜀道难',
          author: '李白',
          dynasty: '唐代',
          genre: '乐府古体',
          paragraphs: [
            '噫吁嚱，危乎高哉！蜀道之难，难于上青天！',
            '蚕丛及鱼凫，开国何茫然！尔来四万八千岁，不与秦塞通人烟。',
            '西当太白有鸟道，可以横绝峨眉巅。地崩山摧壮士死，然后天梯石栈相钩连。',
            '问君西游何时还？畏途巉岩不可攀。但见悲鸟号古木，雄飞雌从绕林间。',
            '连峰去天不盈尺，枯松倒挂倚绝壁。飞湍瀑流争喧豗，砯崖转石万壑雷。',
            '剑阁峥嵘而崔嵬，一夫当关，万夫莫开。所守或匪亲，化为狼与豺。',
            '朝避猛虎，夕避长蛇；磨牙吮血，杀人如麻。锦城虽云乐，不如早还家。',
            '蜀道之难，难于上青天，侧身西望长咨嗟！',
          ],
          famousLines: ['蜀道之难，难于上青天！', '剑阁峥嵘而崔嵬，一夫当关，万夫莫开。'],
          translation: '哎呀呀！多么险峻高耸啊！蜀道之艰险，真是比上青天还要难！那峰峦重叠连绵，离天不到一尺；枯松倒挂在悬崖绝壁之间。瀑布水流飞泻争相喧嚣，冲击岩石如万壑雷鸣！',
          appreciation: '李白浪漫主义手笔登峰造极之作，笔力雄健奇诡，融汇神话与大开大合的奇想。',
          moods: ['豪放旷达', '闲适山水'],
          imagery: ['山', '剑', '松', '明月'],
        },
        {
          title: '登高',
          author: '杜甫',
          dynasty: '唐代',
          genre: '七言律诗',
          paragraphs: [
            '风急天高猿啸哀，渚清沙白鸟飞回。',
            '无边落木萧萧下，不尽长江滚滚来。',
            '万里悲秋常作客，百年多病独登台。',
            '艰难苦恨繁霜鬓，潦倒新停浊酒杯。',
          ],
          famousLines: ['无边落木萧萧下，不尽长江滚滚来。', '万里悲秋常作客，百年多病独登台。'],
          translation: '秋风凛冽，长天高阔，猿声哀戚；水洲清寒，沙洲洁白，沙鸥低回盘旋。无边无际的落叶萧萧飘落，奔腾不息的长江滚滚向东涌流。万里漂泊悲伤客居他乡，一生多病独自登上高台。历尽艰难愁苦增添了满头白发，穷困潦倒近来又不得不停下了手中的浊酒杯。',
          appreciation: '被誉为“杜集七言律诗第一”，八句皆对，字字凝练，将身世飘零之悲与家国之痛融注于苍凉壮阔的江天秋色。',
          moods: ['清冷孤寂', '羁旅思乡', '家国壮志', '惜春感秋'],
          imagery: ['秋风', '落花', '酒', '霜'],
        },
      ];
    } else if (packType === 'songci') {
      packName = '宋词三百首精选';
      packData = [
        {
          title: '定风波·莫听穿林打叶声',
          author: '苏轼',
          dynasty: '宋代',
          genre: '词',
          paragraphs: [
            '莫听穿林打叶声，何妨吟啸且徐行。竹杖芒鞋轻胜马，谁怕？一蓑烟雨任平生。',
            '料峭春风吹酒醒，微冷，山头斜照却相迎。回首向来萧瑟处，归去，也无风雨也无晴。',
          ],
          famousLines: ['竹杖芒鞋轻胜马，谁怕？一蓑烟雨任平生。', '回首向来萧瑟处，归去，也无风雨也无晴。'],
          translation: '不必理会穿透树林敲打树叶的风雨声，不妨放声长啸且自在漫步。拄着竹杖脚穿草鞋，脚步比骑马还要轻捷，有什么可怕的？披着一身蓑衣在烟雨中，任凭平生风吹雨打！料峭春风把醉意吹醒，略有微寒，山头一抹斜阳却已含笑相迎。回头看看刚才风雨萧瑟的地方，归去吧，世间本无所谓风雨，也无所谓天晴。',
          appreciation: '东坡黄州贬谪时旷达洒脱的传世心境写照，展现战胜逆境的从容生命哲学。',
          moods: ['豪放旷达', '静心归隐'],
          imagery: ['雨', '春风', '夕阳', '酒'],
        },
        {
          title: '青玉案·元夕',
          author: '辛弃疾',
          dynasty: '宋代',
          genre: '词',
          paragraphs: [
            '东风夜放花千树，更吹落、星如雨。宝马雕车香满路。凤箫声动，玉壶光转，一夜鱼龙舞。',
            '蛾儿雪柳黄金缕，笑语盈盈暗香去。众里寻他千百度，蓦然回首，那人却在，灯火阑珊处。',
          ],
          famousLines: ['众里寻他千百度，蓦然回首，那人却在，灯火阑珊处。'],
          translation: '东风拂过，仿佛一夜吹开了千万树繁花，更将繁星吹落如同漫天花雨。华丽的马车香气充溢道路。凤箫优美奏响，明月银辉流转，整夜鱼龙彩灯欢腾起舞。仕女们头戴蛾儿雪柳金丝垂饰，笑语盈盈带着阵阵暗香从身旁走过。在千万人群中寻觅她千万次，忽然不经意间回过头来，那个人却独自静立在灯火稀落冷落的深处。',
          appreciation: '以元夕繁华热闹反衬坚守高洁品格的自持之境，王国维《人间词话》喻为治学与人生的最高境界。',
          moods: ['婉约相思', '清冷孤寂'],
          imagery: ['春风', '明月', '雪', '酒'],
        },
      ];
    }

    try {
      const res = await fetch('/api/data/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ poems: packData, sourceHint: packType }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '导入失败');

      setImportMessage({
        type: 'success',
        text: `成功载入【${packName}】(${data.importedCount} 首)，当前库中诗篇总量增至 ${data.totalCount} 首！`,
      });

      refreshStats();
      if (onDataImported) onDataImported();
    } catch (err: any) {
      setImportMessage({ type: 'error', text: err.message });
    } finally {
      setIsImporting(false);
    }
  };

  // Import from remote GitHub raw or jsdelivr URL
  const handleRemoteUrlImport = async () => {
    if (!remoteUrl.trim()) return;

    setIsImporting(true);
    setImportMessage(null);

    try {
      const res = await fetch('/api/data/import-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: remoteUrl.trim(), maxCount: 200 }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '远程抓取导入失败');

      setImportMessage({
        type: 'success',
        text: `已从开源源拉取并规范化导入 ${data.importedCount} 首诗词！当前总收录量为 ${data.totalCount} 首。`,
      });

      refreshStats();
      if (onDataImported) onDataImported();
    } catch (err: any) {
      setImportMessage({ type: 'error', text: `拉取失败: ${err.message}` });
    } finally {
      setIsImporting(false);
    }
  };

  // Local File Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);
        const list = Array.isArray(parsed) ? parsed : [parsed];

        setIsImporting(true);
        setImportMessage(null);

        const res = await fetch('/api/data/import', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ poems: list, sourceHint: file.name }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || '写入失败');

        setImportMessage({
          type: 'success',
          text: `成功导入文件【${file.name}】中的 ${data.importedCount} 首作品，当前总数: ${data.totalCount} 首。`,
        });

        refreshStats();
        if (onDataImported) onDataImported();
      } catch (err: any) {
        setImportMessage({ type: 'error', text: `文件解析失败: ${err.message}` });
      } finally {
        setIsImporting(false);
      }
    };
    reader.readAsText(file);
  };

  // Custom JSON Input
  const handleCustomImport = async () => {
    if (!importJsonText.trim()) return;

    try {
      const parsed = JSON.parse(importJsonText);
      const list = Array.isArray(parsed) ? parsed : [parsed];

      setIsImporting(true);
      setImportMessage(null);

      const res = await fetch('/api/data/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ poems: list }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '导入失败');

      setImportMessage({
        type: 'success',
        text: `批量导入完成！成功写入 ${data.importedCount} 首诗词，当前总量为 ${data.totalCount} 首。`,
      });
      setImportJsonText('');

      refreshStats();
      if (onDataImported) onDataImported();
    } catch (err: any) {
      setImportMessage({ type: 'error', text: `JSON 格式有误: ${err.message}` });
    } finally {
      setIsImporting(false);
    }
  };

  const copyCliCommand = (cmd: string) => {
    navigator.clipboard.writeText(cmd);
    setCopiedCli(true);
    setTimeout(() => setCopiedCli(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs">
      <div className="relative w-full max-w-4xl max-h-[92vh] bg-[#fbf8f2] border border-[#d6cbba] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Top Header */}
        <div className="px-6 py-4 border-b border-[#e6decb] bg-[#f5efe3] flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <Database className="w-5 h-5 text-[#b93a32]" />
            <div>
              <h3 className="text-base font-bold font-classical text-[#2c221a] flex items-center space-x-2">
                <span>{convertText('本地数据服务与开源库导入中心', lang)}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#b93a32]/10 text-[#a02c25] border border-[#b93a32]/20 font-medium">
                  SQLite 3 & MiniSearch
                </span>
              </h3>
              <p className="text-[11px] text-[#8c7864] font-classical">
                {convertText('全面兼容 chinese-poetry / chinese-poetry-api 开源库结构与自动化数据管道', lang)}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#8c7864] hover:text-[#2c221a] hover:bg-[#ede5d5]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Primary Tabs */}
        <div className="px-6 border-b border-[#e6decb] bg-[#f9f5ec] flex items-center space-x-4 text-xs sm:text-sm font-classical">
          <button
            onClick={() => setActiveTab('import')}
            className={`py-3 border-b-2 font-medium tracking-wider transition-colors flex items-center space-x-1.5 ${
              activeTab === 'import'
                ? 'border-[#b93a32] text-[#b93a32]'
                : 'border-transparent text-[#735e4d] hover:text-[#2c221a]'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>{convertText('开源数据导入', lang)}</span>
          </button>

          <button
            onClick={() => setActiveTab('metrics')}
            className={`py-3 border-b-2 font-medium tracking-wider transition-colors flex items-center space-x-1.5 ${
              activeTab === 'metrics'
                ? 'border-[#b93a32] text-[#b93a32]'
                : 'border-transparent text-[#735e4d] hover:text-[#2c221a]'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>{convertText('引擎监控指标', lang)}</span>
          </button>

          <button
            onClick={() => setActiveTab('sql')}
            className={`py-3 border-b-2 font-medium tracking-wider transition-colors flex items-center space-x-1.5 ${
              activeTab === 'sql'
                ? 'border-[#b93a32] text-[#b93a32]'
                : 'border-transparent text-[#735e4d] hover:text-[#2c221a]'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>{convertText('SQL 交互控制台', lang)}</span>
          </button>

          <button
            onClick={() => setActiveTab('aliases')}
            className={`py-3 border-b-2 font-medium tracking-wider transition-colors flex items-center space-x-1.5 ${
              activeTab === 'aliases'
                ? 'border-[#b93a32] text-[#b93a32]'
                : 'border-transparent text-[#735e4d] hover:text-[#2c221a]'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>{convertText('文人字号别名库', lang)}</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: IMPORT (Default Focus) */}
          {activeTab === 'import' && (
            <div className="space-y-6 font-classical">
              {/* Import Sub-mode selector */}
              <div className="flex flex-wrap gap-2 p-1.5 bg-[#f0e8db] rounded-xl text-xs">
                <button
                  onClick={() => setImportMode('preset')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    importMode === 'preset'
                      ? 'bg-white text-[#b93a32] font-bold shadow-xs'
                      : 'text-[#6b5a4b] hover:text-[#2c221a]'
                  }`}
                >
                  经典名篇包 (一键载入)
                </button>
                <button
                  onClick={() => setImportMode('file')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    importMode === 'file'
                      ? 'bg-white text-[#b93a32] font-bold shadow-xs'
                      : 'text-[#6b5a4b] hover:text-[#2c221a]'
                  }`}
                >
                  本地文件上传 (.json)
                </button>
                <button
                  onClick={() => setImportMode('url')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    importMode === 'url'
                      ? 'bg-white text-[#b93a32] font-bold shadow-xs'
                      : 'text-[#6b5a4b] hover:text-[#2c221a]'
                  }`}
                >
                  GitHub / CDN 远程拉取
                </button>
                <button
                  onClick={() => setImportMode('cli')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    importMode === 'cli'
                      ? 'bg-white text-[#b93a32] font-bold shadow-xs'
                      : 'text-[#6b5a4b] hover:text-[#2c221a]'
                  }`}
                >
                  CLI 批量脚本 (数十万首全唐诗)
                </button>
                <button
                  onClick={() => setImportMode('json')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    importMode === 'json'
                      ? 'bg-white text-[#b93a32] font-bold shadow-xs'
                      : 'text-[#6b5a4b] hover:text-[#2c221a]'
                  }`}
                >
                  粘贴 JSON 数组
                </button>
              </div>

              {/* MODE 1: PRESET PACKAGES */}
              {importMode === 'preset' && (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-[#f5efe3] border border-[#e6decb] text-xs text-[#554638] leading-relaxed">
                    {convertText(
                      '已为您预置开源库中最具代表性的传世经典集合。点击按钮即可将数据注入本地 SQLite 并在 MiniSearch 中瞬间构建倒排索引与意境标签图谱：',
                      lang
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {/* Shijing */}
                    <div className="p-4 rounded-xl bg-[#faf6ed] border border-[#e4dcce] flex flex-col justify-between space-y-3 hover:border-[#b93a32]/60 transition-colors">
                      <div>
                        <div className="flex items-center justify-between">
                          <h5 className="font-bold text-sm text-[#2c221a]">
                            《诗经》风雅颂名作选
                          </h5>
                          <span className="text-[10px] bg-[#ede5d5] px-2 py-0.5 rounded text-[#735e4d]">先秦</span>
                        </div>
                        <p className="text-xs text-[#8c7864] mt-1.5 leading-relaxed">
                          包含《关雎》、《蒹葭》、《桃夭》、《采薇》等传世古风，重温中国诗歌源头之美。
                        </p>
                      </div>
                      <button
                        onClick={() => handleLoadPresetPack('shijing')}
                        disabled={isImporting}
                        className="w-full py-2 bg-[#b93a32] hover:bg-[#a12f27] text-white text-xs font-medium rounded-lg disabled:opacity-40 transition-colors shadow-xs"
                      >
                        {isImporting ? '导入中...' : '一键载入《诗经》名篇'}
                      </button>
                    </div>

                    {/* Caocao */}
                    <div className="p-4 rounded-xl bg-[#faf6ed] border border-[#e4dcce] flex flex-col justify-between space-y-3 hover:border-[#b93a32]/60 transition-colors">
                      <div>
                        <div className="flex items-center justify-between">
                          <h5 className="font-bold text-sm text-[#2c221a]">
                            汉魏曹操建安风骨集
                          </h5>
                          <span className="text-[10px] bg-[#ede5d5] px-2 py-0.5 rounded text-[#735e4d]">两汉三国</span>
                        </div>
                        <p className="text-xs text-[#8c7864] mt-1.5 leading-relaxed">
                          包含《短歌行》、《观沧海》、《龟虽寿》等乐府名篇，气吞山河，慷慨多气。
                        </p>
                      </div>
                      <button
                        onClick={() => handleLoadPresetPack('caocao')}
                        disabled={isImporting}
                        className="w-full py-2 bg-[#b93a32] hover:bg-[#a12f27] text-white text-xs font-medium rounded-lg disabled:opacity-40 transition-colors shadow-xs"
                      >
                        {isImporting ? '导入中...' : '一键载入《曹操乐府》'}
                      </button>
                    </div>

                    {/* Tang Shi */}
                    <div className="p-4 rounded-xl bg-[#faf6ed] border border-[#e4dcce] flex flex-col justify-between space-y-3 hover:border-[#b93a32]/60 transition-colors">
                      <div>
                        <div className="flex items-center justify-between">
                          <h5 className="font-bold text-sm text-[#2c221a]">
                            全唐诗·李杜与盛唐名篇
                          </h5>
                          <span className="text-[10px] bg-[#ede5d5] px-2 py-0.5 rounded text-[#735e4d]">唐代</span>
                        </div>
                        <p className="text-xs text-[#8c7864] mt-1.5 leading-relaxed">
                          包含李白《蜀道难》、杜甫《登高》等唐诗瑰宝，千古绝唱，气象万千。
                        </p>
                      </div>
                      <button
                        onClick={() => handleLoadPresetPack('tang')}
                        disabled={isImporting}
                        className="w-full py-2 bg-[#b93a32] hover:bg-[#a12f27] text-white text-xs font-medium rounded-lg disabled:opacity-40 transition-colors shadow-xs"
                      >
                        {isImporting ? '导入中...' : '一键载入《全唐诗选》'}
                      </button>
                    </div>

                    {/* Song Ci */}
                    <div className="p-4 rounded-xl bg-[#faf6ed] border border-[#e4dcce] flex flex-col justify-between space-y-3 hover:border-[#b93a32]/60 transition-colors">
                      <div>
                        <div className="flex items-center justify-between">
                          <h5 className="font-bold text-sm text-[#2c221a]">
                            宋词三百首·豪放与婉约
                          </h5>
                          <span className="text-[10px] bg-[#ede5d5] px-2 py-0.5 rounded text-[#735e4d]">宋代</span>
                        </div>
                        <p className="text-xs text-[#8c7864] mt-1.5 leading-relaxed">
                          包含苏轼《定风波》、辛弃疾《青玉案·元夕》等，兼备人生超脱与雅致柔情。
                        </p>
                      </div>
                      <button
                        onClick={() => handleLoadPresetPack('songci')}
                        disabled={isImporting}
                        className="w-full py-2 bg-[#b93a32] hover:bg-[#a12f27] text-white text-xs font-medium rounded-lg disabled:opacity-40 transition-colors shadow-xs"
                      >
                        {isImporting ? '导入中...' : '一键载入《宋词名篇》'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* MODE 2: LOCAL FILE UPLOAD */}
              {importMode === 'file' && (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-[#f5efe3] border border-[#e6decb] text-xs text-[#554638] leading-relaxed">
                    {convertText(
                      '可以直接导入从 chinese-poetry (github.com/chinese-poetry/chinese-poetry) 项目中下载的任何 JSON 文件（如 poet.tang.0.json, ci.song.0.json, shijing.json 等）。系统内置的数据转换器会自动统一字段名称、补充朝代与意象图谱。',
                      lang
                    )}
                  </div>

                  <div className="border-2 border-dashed border-[#d6cbba] hover:border-[#b93a32] rounded-xl p-8 text-center transition-colors bg-[#faf6ed]/50 flex flex-col items-center justify-center space-y-3">
                    <FileJson className="w-10 h-10 text-[#b93a32]" />
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-[#2c221a]">
                        点击选择或将 chinese-poetry 的 JSON 文件拖拽至此
                      </p>
                      <p className="text-[11px] text-[#8c7864]">
                        支持单个文件包含数千首诗词，浏览器即时流式解析入库
                      </p>
                    </div>
                    <label className="cursor-pointer inline-flex items-center space-x-2 px-4 py-2 bg-[#b93a32] hover:bg-[#a12f27] text-white text-xs font-medium rounded-lg transition-colors shadow-xs">
                      <Upload className="w-4 h-4" />
                      <span>浏览本地 JSON 文件</span>
                      <input
                        type="file"
                        accept=".json"
                        onChange={handleFileUpload}
                        disabled={isImporting}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              )}

              {/* MODE 3: REMOTE URL FETCH */}
              {importMode === 'url' && (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-[#f5efe3] border border-[#e6decb] text-xs text-[#554638] leading-relaxed">
                    {convertText(
                      '支持直接通过 GitHub Raw 或 jsdelivr CDN 链接在线拉取开源库诗词，服务端直接流式写入并建立索引：',
                      lang
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-[#554638]">
                      远程 JSON 链接（示例预填了 jsdelivr 镜像的《诗经》数据）：
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={remoteUrl}
                        onChange={(e) => setRemoteUrl(e.target.value)}
                        placeholder="https://cdn.jsdelivr.net/gh/chinese-poetry/chinese-poetry@master/..."
                        className="flex-1 p-2.5 font-mono text-xs bg-[#fdfaf5] border border-[#ded5c3] rounded-lg text-[#2c221a] focus:outline-none focus:ring-2 focus:ring-[#b93a32]/30"
                      />
                      <button
                        onClick={handleRemoteUrlImport}
                        disabled={isImporting || !remoteUrl.trim()}
                        className="px-4 py-2.5 bg-[#b93a32] hover:bg-[#a12f27] disabled:opacity-40 text-white text-xs font-medium rounded-lg transition-colors flex items-center space-x-1.5 shadow-xs shrink-0"
                      >
                        <Globe className="w-3.5 h-3.5" />
                        <span>{isImporting ? '抓取中...' : '开始拉取'}</span>
                      </button>
                    </div>
                  </div>

                  <div className="text-xs space-y-1 text-[#735e4d]">
                    <p className="font-bold">开源仓库常见 JSON 路径推荐：</p>
                    <div className="space-y-1 font-mono text-[11px] text-[#8c7864]">
                      <div
                        onClick={() => setRemoteUrl('https://cdn.jsdelivr.net/gh/chinese-poetry/chinese-poetry@master/shijing/shijing.json')}
                        className="cursor-pointer hover:text-[#b93a32] underline"
                      >
                        shijing/shijing.json (诗经)
                      </div>
                      <div
                        onClick={() => setRemoteUrl('https://cdn.jsdelivr.net/gh/chinese-poetry/chinese-poetry@master/caocao/caocao.json')}
                        className="cursor-pointer hover:text-[#b93a32] underline"
                      >
                        caocao/caocao.json (曹操诗集)
                      </div>
                      <div
                        onClick={() => setRemoteUrl('https://cdn.jsdelivr.net/gh/chinese-poetry/chinese-poetry@master/chuci/chuci.json')}
                        className="cursor-pointer hover:text-[#b93a32] underline"
                      >
                        chuci/chuci.json (楚辞)
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* MODE 4: CLI SCRIPT (FOR HUGE CORPUS) */}
              {importMode === 'cli' && (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-[#f5efe3] border border-[#e6decb] text-xs text-[#554638] leading-relaxed space-y-2">
                    <p className="font-bold text-[#2c221a]">
                      针对数十万首全唐诗、全宋诗的超大规模批量导入方案：
                    </p>
                    <p>
                      开源项目 chinese-poetry 的全唐诗与全宋诗体积达数百兆。本项目内置了高性能 CLI 导入脚本
                      <code className="bg-[#ede5d5] px-1.5 py-0.5 rounded text-[#b93a32] font-mono mx-1">
                        scripts/import_chinese_poetry.ts
                      </code>
                      ，可在终端以流水线方式全量压入 SQLite 引擎。
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div className="space-y-1">
                      <span className="text-xs font-bold text-[#554638]">步骤 1：克隆开源项目仓库</span>
                      <div className="p-3 bg-[#1e222b] rounded-xl font-mono text-xs text-[#e2e8f0] flex items-center justify-between">
                        <code>git clone https://github.com/chinese-poetry/chinese-poetry.git</code>
                        <button
                          onClick={() => copyCliCommand('git clone https://github.com/chinese-poetry/chinese-poetry.git')}
                          className="text-[#94a3b8] hover:text-white"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <span className="text-xs font-bold text-[#554638]">步骤 2：执行内置 CLI 批量入库脚本</span>
                      <div className="p-3 bg-[#1e222b] rounded-xl font-mono text-xs text-[#e2e8f0] flex items-center justify-between">
                        <code>npm run import-poetry -- --dir=./chinese-poetry/全唐诗 --dynasty=唐代</code>
                        <button
                          onClick={() => copyCliCommand('npm run import-poetry -- --dir=./chinese-poetry/全唐诗 --dynasty=唐代')}
                          className="text-[#94a3b8] hover:text-white"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {copiedCli && (
                    <div className="text-xs text-emerald-700 flex items-center space-x-1">
                      <Check className="w-3.5 h-3.5" />
                      <span>命令已复制到剪贴板！</span>
                    </div>
                  )}
                </div>
              )}

              {/* MODE 5: RAW JSON TEXTAREA */}
              {importMode === 'json' && (
                <div className="space-y-3">
                  <label className="block text-xs font-bold text-[#554638]">
                    {convertText('直接粘贴 JSON 数组（支持 chinese-poetry 原始结构或标准格式）：', lang)}
                  </label>
                  <textarea
                    rows={6}
                    value={importJsonText}
                    onChange={(e) => setImportJsonText(e.target.value)}
                    placeholder={`[\n  {\n    "title": "春夜喜雨",\n    "author": "杜甫",\n    "paragraphs": ["好雨知时节，当春乃发生。", "随风潜入夜，润物细无声。"]\n  }\n]`}
                    className="w-full p-3 font-mono text-xs bg-[#fdfaf5] border border-[#ded5c3] rounded-xl text-[#2c221a] focus:outline-none focus:ring-2 focus:ring-[#b93a32]/30 resize-none"
                  />
                  <button
                    onClick={handleCustomImport}
                    disabled={isImporting || !importJsonText.trim()}
                    className="flex items-center space-x-1.5 px-4 py-2 bg-[#2c221a] hover:bg-[#3f3227] disabled:opacity-40 text-white text-xs font-medium rounded-lg transition-colors"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>{isImporting ? '正在解析导入...' : '执行 JSON 批量入库'}</span>
                  </button>
                </div>
              )}

              {/* Status Message */}
              {importMessage && (
                <div
                  className={`p-3.5 rounded-xl text-xs flex items-center space-x-2 border ${
                    importMessage.type === 'success'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : 'bg-red-50 text-red-800 border-red-200'
                  }`}
                >
                  {importMessage.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                  ) : (
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                  )}
                  <span>{importMessage.text}</span>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: METRICS */}
          {activeTab === 'metrics' && (
            <div className="space-y-6 font-classical">
              {isLoadingStats && !stats ? (
                <div className="text-center py-12 text-[#8c7864] text-xs">
                  {convertText('正在探查数据引擎状态...', lang)}
                </div>
              ) : stats ? (
                <>
                  {/* Metric Cards Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="bg-[#faf6ed] border border-[#e4dcce] rounded-xl p-4 space-y-1">
                      <span className="text-xs text-[#8c7864]">{convertText('收录诗篇总数', lang)}</span>
                      <div className="text-2xl font-bold text-[#b93a32]">{stats.totalPoems}</div>
                      <div className="text-[10px] text-[#735e4d]">{convertText('SQLite 本地持久化', lang)}</div>
                    </div>

                    <div className="bg-[#faf6ed] border border-[#e4dcce] rounded-xl p-4 space-y-1">
                      <span className="text-xs text-[#8c7864]">{convertText('诗人词家总数', lang)}</span>
                      <div className="text-2xl font-bold text-[#2c221a]">{stats.totalAuthors}</div>
                      <div className="text-[10px] text-[#735e4d]">{convertText('支持字号自动消歧', lang)}</div>
                    </div>

                    <div className="bg-[#faf6ed] border border-[#e4dcce] rounded-xl p-4 space-y-1">
                      <span className="text-xs text-[#8c7864]">{convertText('倒排索引词条量', lang)}</span>
                      <div className="text-2xl font-bold text-[#2c221a]">{stats.indexTermCount}</div>
                      <div className="text-[10px] text-[#735e4d]">{convertText('MiniSearch 毫秒检索引擎', lang)}</div>
                    </div>

                    <div className="bg-[#faf6ed] border border-[#e4dcce] rounded-xl p-4 space-y-1">
                      <span className="text-xs text-[#8c7864]">{convertText('服务运行时间', lang)}</span>
                      <div className="text-2xl font-bold text-[#2c221a]">{stats.uptimeSeconds}s</div>
                      <div className="text-[10px] text-emerald-700 flex items-center space-x-1">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>{convertText('服务健康运转', lang)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Dynasty Distribution & Top Imagery */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Dynasty distribution */}
                    <div className="bg-[#faf6ed] border border-[#e4dcce] rounded-xl p-5 space-y-3">
                      <h4 className="text-xs font-bold text-[#735e4d] tracking-wider flex items-center justify-between">
                        <span>{convertText('朝代作品分布统计', lang)}</span>
                        <Layers className="w-3.5 h-3.5 text-[#8c7864]" />
                      </h4>
                      <div className="space-y-2 text-xs">
                        {Object.entries(stats.dynastiesCount).map(([dyn, rawCount]) => {
                          const count = Number(rawCount) || 0;
                          const percent = stats.totalPoems > 0 ? Math.round((count / stats.totalPoems) * 100) : 0;
                          return (
                            <div key={dyn} className="space-y-1">
                              <div className="flex justify-between text-[#46392f]">
                                <span>{dyn}</span>
                                <span>{count} 首 ({percent}%)</span>
                              </div>
                              <div className="w-full bg-[#ede5d5] rounded-full h-1.5 overflow-hidden">
                                <div
                                  className="bg-[#b93a32] h-1.5 rounded-full"
                                  style={{ width: `${percent}%` }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Top Imagery Tags */}
                    <div className="bg-[#faf6ed] border border-[#e4dcce] rounded-xl p-5 space-y-3">
                      <h4 className="text-xs font-bold text-[#735e4d] tracking-wider flex items-center justify-between">
                        <span>{convertText('高频意象分布 Top 10', lang)}</span>
                        <span className="text-[10px] text-[#8c7864]">知识图谱标签</span>
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {stats.topImagery.map((item) => (
                          <div
                            key={item.name}
                            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#f4ebe0] border border-[#ded5c5] text-xs"
                          >
                            <span className="font-bold text-[#2c221a]">{item.name}</span>
                            <span className="text-[10px] text-[#8c7864] bg-white/70 px-1.5 rounded">
                              {item.count}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </>
              ) : null}
            </div>
          )}

          {/* TAB 3: SQL CONSOLE */}
          {activeTab === 'sql' && (
            <div className="space-y-4 font-classical">
              {/* Quick Query Presets */}
              <div className="flex items-center space-x-2 overflow-x-auto pb-1 text-xs">
                <span className="text-[#8c7864] shrink-0 font-medium">常用查询预设:</span>
                <button
                  onClick={() => {
                    const q = 'SELECT dynasty, count(*) as count FROM poems GROUP BY dynasty ORDER BY count DESC;';
                    setSqlQuery(q);
                    handleExecuteSql(q);
                  }}
                  className="px-2.5 py-1 rounded bg-[#ede5d5] hover:bg-[#ded4c1] text-[#423326] shrink-0"
                >
                  朝代作品分布
                </button>
                <button
                  onClick={() => {
                    const q = 'SELECT author, count(*) as count FROM poems GROUP BY author ORDER BY count DESC LIMIT 8;';
                    setSqlQuery(q);
                    handleExecuteSql(q);
                  }}
                  className="px-2.5 py-1 rounded bg-[#ede5d5] hover:bg-[#ded4c1] text-[#423326] shrink-0"
                >
                  诗人作品排名
                </button>
                <button
                  onClick={() => {
                    const q = 'SELECT title, author, famous_lines FROM poems WHERE famous_lines IS NOT NULL LIMIT 5;';
                    setSqlQuery(q);
                    handleExecuteSql(q);
                  }}
                  className="px-2.5 py-1 rounded bg-[#ede5d5] hover:bg-[#ded4c1] text-[#423326] shrink-0"
                >
                  经典名句检视
                </button>
                <button
                  onClick={() => {
                    const q = 'SELECT query, results_count, duration_ms, created_at FROM query_logs ORDER BY id DESC LIMIT 5;';
                    setSqlQuery(q);
                    handleExecuteSql(q);
                  }}
                  className="px-2.5 py-1 rounded bg-[#ede5d5] hover:bg-[#ded4c1] text-[#423326] shrink-0"
                >
                  最近查询日志
                </button>
              </div>

              {/* SQL Input Area */}
              <div className="space-y-2">
                <div className="relative">
                  <textarea
                    rows={3}
                    value={sqlQuery}
                    onChange={(e) => setSqlQuery(e.target.value)}
                    placeholder="输入标准的 SQLite SELECT 查询语句..."
                    className="w-full p-3 font-mono text-xs sm:text-sm bg-[#1e222b] text-[#f1f5f9] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#b93a32]/50 resize-none"
                  />
                  <button
                    onClick={() => handleExecuteSql()}
                    disabled={isExecutingSql || !sqlQuery.trim()}
                    className="absolute right-3 bottom-3 flex items-center space-x-1.5 px-3 py-1.5 bg-[#b93a32] hover:bg-[#a12f27] text-white text-xs font-medium rounded-lg disabled:opacity-40 transition-colors shadow-xs"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>{isExecutingSql ? '执行中...' : '运行查询'}</span>
                  </button>
                </div>
              </div>

              {/* Error Message */}
              {sqlError && (
                <div className="p-3 rounded-lg bg-red-50 text-red-700 text-xs border border-red-200 flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{sqlError}</span>
                </div>
              )}

              {/* Result Table */}
              {sqlResult && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-[#8c7864]">
                    <span>共返回 {sqlResult.rowCount} 行记录</span>
                    <span className="flex items-center space-x-1 text-emerald-700 font-mono">
                      <Clock className="w-3 h-3" />
                      <span>执行耗时: {sqlResult.durationMs} ms</span>
                    </span>
                  </div>

                  <div className="border border-[#e4dcce] rounded-xl overflow-x-auto bg-[#faf6ed] max-h-60">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead className="bg-[#ede5d5] text-[#423326] sticky top-0">
                        <tr>
                          {sqlResult.columns.map((col) => (
                            <th key={col} className="p-2.5 font-bold border-b border-[#ded4c1]">
                              {col}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {sqlResult.values.map((row, rowIdx) => (
                          <tr key={rowIdx} className="hover:bg-[#f5ecdd] border-b border-[#f0e8db]">
                            {row.map((val: any, valIdx: number) => (
                              <td key={valIdx} className="p-2.5 font-mono text-[#382f27] max-w-xs truncate">
                                {typeof val === 'object' ? JSON.stringify(val) : String(val ?? '')}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: ALIASES */}
          {activeTab === 'aliases' && (
            <div className="space-y-4 font-classical">
              <div className="bg-[#f5efe3] p-4 rounded-xl border border-[#e6decb] text-xs text-[#554638] leading-relaxed">
                {convertText(
                  '【智能消歧与字号映射】当用户输入诗人的别号（如“东坡居士”、“青莲居士”、“少陵野老”）、字（如“太白”、“子美”、“子瞻”）或别名时，服务层会自动映射到规范化的作者名，实现精准检索。点击任意别号可直接测试检索：',
                  lang
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                {Object.entries(aliases).map(([alias, realName]) => (
                  <button
                    key={alias}
                    onClick={() => {
                      onSearchWithAlias(alias);
                      onClose();
                    }}
                    className="p-3 rounded-xl bg-[#faf6ed] hover:bg-[#fcf8f0] border border-[#e4dcce] hover:border-[#b93a32] text-left transition-all group"
                  >
                    <div className="text-xs font-bold text-[#2c221a] group-hover:text-[#b93a32]">
                      {alias}
                    </div>
                    <div className="text-[11px] text-[#8c7864] mt-0.5 flex items-center space-x-1">
                      <span>→</span>
                      <span className="font-semibold text-[#554638]">{realName}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
